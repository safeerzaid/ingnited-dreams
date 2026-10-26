import { Router } from "express";
import { instructorController } from "../controllers/instructorController";
import { authenticateUser, requireRole } from "../middleware/auth";
import { Role } from "../types/enums";

const router = Router();

router.use(authenticateUser, requireRole([Role.INSTRUCTOR, Role.ADMIN]));

router.get("/dashboard", instructorController.getDashboard);
router.get("/classes", instructorController.getClasses);
router.get("/classes/:id", instructorController.getClassById);
router.post("/classes/:id/start", instructorController.startClass);
router.post("/classes/:id/end", instructorController.endClass);

export default router;
