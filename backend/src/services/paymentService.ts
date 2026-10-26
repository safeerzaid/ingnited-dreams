import crypto from "crypto";
import { prisma } from "./prisma";
import { razorpayService } from "./razorpayService";
import { notificationService } from "./notificationService";
import { auditService } from "./auditService";
import { emailService } from "./emailService";
import { config } from "../config";
import { logger } from "../utils/logger";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/errors";
import { CourseStatus, Role } from "../types/enums";

export const PaymentStatus = {
  CREATED: "CREATED",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

const OPEN_BATCH_STATUSES = ["UPCOMING", "ACTIVE"];

function generateReceiptNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `IDR-${ymd}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function formatInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export class PaymentService {
  /**
   * Step 1 of checkout: validates seat availability and creates a Razorpay order + local Payment row.
   */
  async createOrder(
    user: { id: string; role: Role },
    params: { courseSlug: string; batchId: string; educationLevel?: string }
  ) {
    if (user.role !== Role.STUDENT) {
      throw new ForbiddenError("Only student accounts can enroll in a course.");
    }

    const course = await prisma.course.findUnique({ where: { slug: params.courseSlug } });
    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundError("This course is not open for admission.");
    }
    if (!course.price || course.price <= 0) {
      throw new BadRequestError("Course fee has not been set. Please contact the academy.");
    }

    const batch = await prisma.batch.findUnique({ where: { id: params.batchId } });
    if (!batch || batch.courseId !== course.id || !OPEN_BATCH_STATUSES.includes(batch.status)) {
      throw new BadRequestError("Selected batch is not open for admission.");
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { studentId: user.id, courseId: course.id, status: "ACTIVE" },
    });
    if (existingEnrollment) {
      throw new ConflictError("You are already enrolled in this course.");
    }

    const seatsTaken = await prisma.enrollment.count({
      where: { batchId: batch.id, status: "ACTIVE" },
    });
    if (seatsTaken >= batch.capacity) {
      throw new ConflictError("This batch is full. Please choose another batch.");
    }

    const student = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!student) throw new NotFoundError("Student account not found.");

    if (params.educationLevel) {
      await prisma.studentProfile.updateMany({
        where: { userId: user.id },
        data: { educationLevel: params.educationLevel },
      });
    }

    const amountPaise = course.price * 100;
    const receiptNumber = generateReceiptNumber();

    const order = await razorpayService.createOrder({
      amountPaise,
      receipt: receiptNumber,
      notes: { userId: user.id, courseId: course.id, batchId: batch.id },
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        batchId: batch.id,
        providerOrderId: order.id,
        amount: amountPaise,
        currency: "INR",
        status: PaymentStatus.CREATED,
        receiptNumber,
      },
    });

    return {
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      keyId: razorpayService.keyId,
      testMode: razorpayService.isTestMode,
      receiptNumber,
      course: { id: course.id, title: course.title, code: course.code },
      batch: { id: batch.id, name: batch.name },
      prefill: { name: student.name, email: student.email, contact: student.phone || "" },
    };
  }

  /**
   * Step 2 of checkout: browser posts the Razorpay handler response; we verify the signature
   * server-side, confirm the payment with Razorpay, then enroll the student.
   */
  async verifyCheckout(
    user: { id: string },
    params: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
    ipAddress?: string
  ) {
    const payment = await prisma.payment.findUnique({
      where: { providerOrderId: params.razorpay_order_id },
    });
    if (!payment || payment.userId !== user.id) {
      throw new NotFoundError("Payment order not found.");
    }

    const valid = razorpayService.verifyCheckoutSignature(
      params.razorpay_order_id,
      params.razorpay_payment_id,
      params.razorpay_signature
    );
    if (!valid) {
      await auditService.log({
        actorId: user.id,
        action: "PAYMENT_SIGNATURE_INVALID",
        entity: "Payment",
        entityId: payment.id,
        ipAddress,
      });
      throw new BadRequestError("Payment verification failed. If money was debited, it will be refunded automatically.");
    }

    let rzpPayment = await razorpayService.fetchPayment(params.razorpay_payment_id);
    if (rzpPayment.order_id !== payment.providerOrderId || rzpPayment.amount !== payment.amount) {
      throw new BadRequestError("Payment details do not match this order.");
    }
    if (rzpPayment.status === "authorized") {
      rzpPayment = await razorpayService.capturePayment(rzpPayment.id, payment.amount);
    }
    if (rzpPayment.status !== "captured") {
      throw new BadRequestError(`Payment is not complete (status: ${rzpPayment.status}).`);
    }

    await this.fulfil(payment.providerOrderId, rzpPayment.id, rzpPayment.method, ipAddress);
    return this.getReceipt(payment.id, user.id);
  }

  /**
   * Marks the order PAID and creates the enrollment. Idempotent: safe to call from both the
   * browser verification and the Razorpay webhook, in any order.
   */
  async fulfil(orderId: string, paymentId: string, method?: string, ipAddress?: string) {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { providerOrderId: orderId } });
      if (!payment) return null;
      if (payment.status === PaymentStatus.PAID) return { payment, newlyPaid: false };

      const enrollment = await tx.enrollment.upsert({
        where: { studentId_batchId: { studentId: payment.userId, batchId: payment.batchId } },
        create: {
          studentId: payment.userId,
          courseId: payment.courseId,
          batchId: payment.batchId,
          status: "ACTIVE",
        },
        update: { status: "ACTIVE" },
      });

      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerPaymentId: paymentId,
          method: method || null,
          paidAt: new Date(),
          failureReason: null,
          enrollmentId: enrollment.id,
        },
      });

      return { payment: updated, newlyPaid: true };
    });

    if (!result) {
      logger.warn(`Fulfil called for unknown Razorpay order ${orderId}`);
      return null;
    }
    if (!result.newlyPaid) return result.payment;

    const full = await prisma.payment.findUnique({
      where: { id: result.payment.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true, code: true } },
        batch: { select: { name: true, startDate: true, scheduleLabel: true } },
      },
    });
    if (!full) return result.payment;

    logger.info(`Payment ${full.receiptNumber} PAID (${formatInr(full.amount)}). Enrolled ${full.user.email} in ${full.batch.name}.`);

    await auditService.log({
      actorId: full.userId,
      action: "PAYMENT_CAPTURED_ENROLLED",
      entity: "Payment",
      entityId: full.id,
      metadata: {
        receiptNumber: full.receiptNumber,
        amountPaise: full.amount,
        orderId,
        paymentId,
        course: full.course.code,
        batch: full.batch.name,
      },
      ipAddress,
    });

    await notificationService.notify({
      userId: full.userId,
      type: "NEW_ENROLLMENT",
      title: "Admission Confirmed",
      message: `Your fee of ${formatInr(full.amount)} is received (receipt ${full.receiptNumber}). You are enrolled in ${full.course.title} — ${full.batch.name}.`,
      link: "/student/dashboard",
    });

    const startDate = full.batch.startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    await emailService.send({
      to: full.user.email,
      subject: `Admission confirmed — ${full.course.title}`,
      text: [
        `Hi ${full.user.name},`,
        "",
        `Your payment of ${formatInr(full.amount)} has been received and your seat is confirmed.`,
        "",
        `Receipt number: ${full.receiptNumber}`,
        `Razorpay payment ID: ${paymentId}`,
        `Course: ${full.course.title} (${full.course.code})`,
        `Batch: ${full.batch.name}${full.batch.scheduleLabel ? ` — ${full.batch.scheduleLabel}` : ""}`,
        `Batch starts: ${startDate}`,
        "",
        `Log in to your student portal: ${config.cors.frontendUrl}/student/dashboard`,
        "",
        `— ${config.academy.name}`,
      ].join("\n"),
    });

    if (config.mail.adminInbox) {
      await emailService.send({
        to: config.mail.adminInbox,
        subject: `New admission: ${full.user.name} — ${full.course.code}`,
        text: `${full.user.name} (${full.user.email}) paid ${formatInr(full.amount)} for ${full.course.title}, ${full.batch.name}. Receipt ${full.receiptNumber}.`,
      });
    }

    return full;
  }

  async markFailed(orderId: string, reason: string, userId?: string) {
    const payment = await prisma.payment.findUnique({ where: { providerOrderId: orderId } });
    if (!payment) return null;
    if (userId && payment.userId !== userId) throw new NotFoundError("Payment order not found.");
    if (payment.status === PaymentStatus.PAID) return payment;

    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED, failureReason: reason.slice(0, 500) },
    });
  }

  /**
   * Razorpay webhook: payment.captured / order.paid fulfil the order, payment.failed records the failure.
   */
  async handleWebhookEvent(event: {
    event: string;
    payload?: {
      payment?: { entity?: { id: string; order_id: string; amount: number; method?: string; error_description?: string } };
    };
  }) {
    const entity = event.payload?.payment?.entity;
    if (!entity?.order_id) {
      logger.debug(`Razorpay webhook ${event.event} ignored (no payment entity)`);
      return;
    }

    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        const payment = await prisma.payment.findUnique({ where: { providerOrderId: entity.order_id } });
        if (payment && payment.amount !== entity.amount) {
          logger.error(`Razorpay webhook amount mismatch for order ${entity.order_id}`);
          return;
        }
        await this.fulfil(entity.order_id, entity.id, entity.method);
        break;
      }
      case "payment.failed":
        await this.markFailed(entity.order_id, entity.error_description || "Payment failed");
        break;
      default:
        logger.debug(`Unhandled Razorpay webhook event: ${event.event}`);
    }
  }

  async getReceipt(paymentId: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: { name: true, email: true, phone: true, studentProfile: { select: { registrationNumber: true } } },
        },
        course: { select: { title: true, code: true, slug: true } },
        batch: {
          select: {
            name: true,
            code: true,
            startDate: true,
            endDate: true,
            scheduleLabel: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });
    if (!payment || payment.userId !== userId) throw new NotFoundError("Receipt not found.");
    return payment;
  }

  async getStudentPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { title: true, code: true } },
        batch: { select: { name: true } },
      },
    });
  }

  async getAdminPayments(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 25;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { receiptNumber: { contains: params.search } },
        { providerPaymentId: { contains: params.search } },
        { user: { email: { contains: params.search } } },
        { user: { name: { contains: params.search } } },
      ];
    }

    const [total, payments, revenue] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          course: { select: { title: true, code: true } },
          batch: { select: { name: true } },
        },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        paidCount: revenue._count,
        revenuePaise: revenue._sum.amount || 0,
      },
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
