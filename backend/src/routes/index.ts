import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import studentRoutes from "./student.routes";
import instructorRoutes from "./instructor.routes";
import adminRoutes from "./admin.routes";
import recordingRoutes from "./recording.routes";
import livekitRoutes from "./livekit.routes";
import webhookRoutes from "./webhook.routes";
import publicRoutes from "./public.routes";
import paymentRoutes from "./payment.routes";
import { cleanupService } from "../services/cleanupService";
import { config } from "../config";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();

// Mount route groups
router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/instructor", instructorRoutes);
router.use("/admin", adminRoutes);
router.use("/recordings", recordingRoutes);
router.use("/livekit", livekitRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/public", publicRoutes);
router.use("/payments", paymentRoutes);

// Internal manual cleanup trigger (e.g., cron ping from outside)
router.post("/internal/cleanup-recordings", async (req: Request, res: Response) => {
  const authKey = req.headers["x-cleanup-secret"] || req.query.secret;
  if (authKey !== config.cleanup.secret) {
    return res.status(403).json({ success: false, message: "Invalid cleanup secret key" });
  }

  const result = await cleanupService.cleanupExpiredRecordings();
  return sendSuccess(res, result, "Recording cleanup job executed successfully");
});

export default router;
