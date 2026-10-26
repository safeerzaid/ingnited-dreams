import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/paymentService";
import { razorpayService } from "../services/razorpayService";
import {
  createOrderSchema,
  verifyPaymentSchema,
  paymentFailureSchema,
} from "../validators/payment.validator";
import { sendSuccess } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export class PaymentController {
  async getConfig(req: Request, res: Response) {
    return sendSuccess(res, {
      enabled: razorpayService.isConfigured,
      keyId: razorpayService.keyId || null,
      testMode: razorpayService.isTestMode,
    });
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await paymentService.createOrder(req.user!, validated);
      return sendSuccess(res, order, "Payment order created", 201);
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = verifyPaymentSchema.parse(req.body);
      const receipt = await paymentService.verifyCheckout(req.user!, validated, req.ip);
      return sendSuccess(res, receipt, "Payment verified and admission confirmed");
    } catch (error) {
      next(error);
    }
  }

  async reportFailure(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = paymentFailureSchema.parse(req.body);
      await paymentService.markFailed(validated.orderId, validated.reason, req.user!.id);
      return sendSuccess(res, null, "Payment failure recorded");
    } catch (error) {
      next(error);
    }
  }

  async getMyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getStudentPayments(req.user!.id);
      return sendSuccess(res, payments);
    } catch (error) {
      next(error);
    }
  }

  async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await paymentService.getReceipt(String(req.params.id), req.user!.id);
      return sendSuccess(res, receipt);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Razorpay webhook (configure in Razorpay Dashboard → Webhooks):
   * events payment.captured, payment.failed, order.paid
   */
  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const rawBody = req.rawBody;

    if (!rawBody || !razorpayService.verifyWebhookSignature(rawBody, signature)) {
      logger.warn("Rejected Razorpay webhook with missing/invalid signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    try {
      await paymentService.handleWebhookEvent(JSON.parse(rawBody.toString("utf8")));
      return res.status(200).json({ received: true });
    } catch (error) {
      logger.error("Error processing Razorpay webhook", error);
      // Non-2xx makes Razorpay retry the delivery
      return res.status(500).json({ received: false });
    }
  }
}

export const paymentController = new PaymentController();
export default paymentController;
