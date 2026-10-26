import crypto from "crypto";
import { config } from "../config";
import { logger } from "../utils/logger";
import { ServiceUnavailableError, BadRequestError } from "../utils/errors";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string; // created, authorized, captured, refunded, failed
  method?: string;
  error_description?: string | null;
}

const API_BASE = "https://api.razorpay.com/v1";

/**
 * Thin client over the Razorpay Orders/Payments REST API.
 * Test mode vs live mode is decided purely by the key pair (rzp_test_* / rzp_live_*).
 */
export class RazorpayService {
  get isConfigured() {
    return Boolean(config.razorpay.keyId && config.razorpay.keySecret);
  }

  get keyId() {
    return config.razorpay.keyId;
  }

  get isTestMode() {
    return config.razorpay.keyId.startsWith("rzp_test_");
  }

  private assertConfigured() {
    if (!this.isConfigured) {
      throw new ServiceUnavailableError(
        "Online payments are not configured yet. Please contact the academy office."
      );
    }
  }

  private authHeader() {
    const token = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString("base64");
    return `Basic ${token}`;
  }

  private async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    this.assertConfigured();

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const description =
        (json.error as { description?: string } | undefined)?.description || `HTTP ${res.status}`;
      logger.error(`Razorpay API ${method} ${path} failed: ${description}`);
      throw new BadRequestError(`Payment gateway error: ${description}`);
    }
    return json as T;
  }

  async createOrder(params: {
    amountPaise: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrder> {
    return this.request<RazorpayOrder>("POST", "/orders", {
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    });
  }

  async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    return this.request<RazorpayPayment>("GET", `/payments/${encodeURIComponent(paymentId)}`);
  }

  /**
   * Captures an authorized payment (only needed when auto-capture is disabled on the Razorpay account)
   */
  async capturePayment(paymentId: string, amountPaise: number): Promise<RazorpayPayment> {
    return this.request<RazorpayPayment>("POST", `/payments/${encodeURIComponent(paymentId)}/capture`, {
      amount: amountPaise,
      currency: "INR",
    });
  }

  /**
   * Verifies the signature returned to the browser by Razorpay Checkout.
   * signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
   */
  verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
    this.assertConfigured();
    const expected = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return safeEqual(expected, signature);
  }

  /**
   * Verifies X-Razorpay-Signature on webhook deliveries against the raw request body.
   */
  verifyWebhookSignature(rawBody: Buffer | string, signature: string | undefined): boolean {
    if (!config.razorpay.webhookSecret || !signature) return false;
    const expected = crypto
      .createHmac("sha256", config.razorpay.webhookSecret)
      .update(rawBody)
      .digest("hex");
    return safeEqual(expected, signature);
  }
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export const razorpayService = new RazorpayService();
export default razorpayService;
