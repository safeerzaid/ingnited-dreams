import { z } from "zod";

export const createOrderSchema = z.object({
  courseSlug: z.string().min(2).max(100),
  batchId: z.string().min(1),
  educationLevel: z.string().max(120).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(5),
  razorpay_payment_id: z.string().min(5),
  razorpay_signature: z.string().min(10),
});

export const paymentFailureSchema = z.object({
  orderId: z.string().min(5),
  reason: z.string().max(500).optional().default("Payment cancelled or failed"),
});
