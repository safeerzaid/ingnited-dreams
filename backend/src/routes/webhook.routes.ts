import { Router } from "express";
import { webhookController } from "../controllers/webhookController";
import { paymentController } from "../controllers/paymentController";

const router = Router();

// Both receivers verify signatures against req.rawBody (captured by the JSON parser in app.ts)
router.post("/livekit", webhookController.handleLiveKitWebhook);
router.post("/razorpay", paymentController.handleWebhook);

export default router;
