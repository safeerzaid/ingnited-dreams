import { Router } from "express";
import { livekitController } from "../controllers/livekitController";
import { authenticateUser, requireRole } from "../middleware/auth";
import { Role } from "../types/enums";

const router = Router();

// Participant token generation for authorized students and instructors
router.post("/token", authenticateUser, livekitController.getToken);

// Room start/end
router.post("/rooms/:id/start", authenticateUser, requireRole([Role.INSTRUCTOR, Role.ADMIN]), livekitController.startClass);
router.post("/rooms/:id/end", authenticateUser, requireRole([Role.INSTRUCTOR, Role.ADMIN]), livekitController.endClass);

export default router;
