import { Router } from "express";
import { authController } from "../controllers/authController";
import { authLimiter } from "../middleware/rateLimiter";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.post("/change-password", authLimiter, authenticateUser, authController.changePassword);
router.get("/me", authenticateUser, authController.me);

export default router;
