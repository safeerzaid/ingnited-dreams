import { Router } from "express";
import { recordingController } from "../controllers/recordingController";
import { authenticateUser } from "../middleware/auth";
import { recordingLimiter } from "../middleware/rateLimiter";

const router = Router();

// Playback and download routes requiring authentication and strict server-side 7-day expiry enforcement
router.get("/:id/play", authenticateUser, recordingLimiter, recordingController.getPlayback);
router.get("/:id/download", authenticateUser, recordingLimiter, recordingController.getDownload);

export default router;
