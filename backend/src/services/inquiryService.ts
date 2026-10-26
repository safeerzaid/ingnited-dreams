import { prisma } from "./prisma";
import { emailService } from "./emailService";
import { config } from "../config";
import { NotFoundError } from "../utils/errors";

export class InquiryService {
  async create(
    data: { name: string; email: string; phone?: string; subject?: string; message: string },
    ipAddress?: string
  ) {
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
        ipAddress,
      },
    });

    if (config.mail.adminInbox) {
      await emailService.send({
        to: config.mail.adminInbox,
        replyTo: data.email,
        subject: `Website enquiry: ${data.subject || "General"} — ${data.name}`,
        text: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone || "-"}`,
          `Subject: ${data.subject || "-"}`,
          "",
          data.message,
        ].join("\n"),
      });
    }

    return { id: inquiry.id };
  }

  async list(params: { status?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const where = params.status ? { status: params.status } : {};

    const [total, inquiries, openCount] = await Promise.all([
      prisma.contactInquiry.count({ where }),
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactInquiry.count({ where: { status: "NEW" } }),
    ]);

    return { inquiries, total, page, limit, totalPages: Math.ceil(total / limit), openCount };
  }

  async updateStatus(id: string, status: "NEW" | "RESOLVED") {
    const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
    if (!inquiry) throw new NotFoundError("Inquiry not found");
    return prisma.contactInquiry.update({ where: { id }, data: { status } });
  }
}

export const inquiryService = new InquiryService();
export default inquiryService;
