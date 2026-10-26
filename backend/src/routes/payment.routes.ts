import { Router } from "express";
import { paymentController } from "../controllers/paymentController";
import { authenticateUser, requireRole } from "../middleware/auth";
import { paymentLimiter } from "../middleware/rateLimiter";
import { Role } from "../types/enums";

const router = Router();

router.get("/config", paymentController.getConfig);

router.use(authenticateUser, requireRole([Role.STUDENT]));

router.post("/order", paymentLimiter, paymentController.createOrder);
router.post("/verify", paymentLimiter, paymentController.verify);
router.post("/failure", paymentLimiter, paymentController.reportFailure);
router.get("/mine", paymentController.getMyPayments);
router.get("/:id/receipt", paymentController.getReceipt);

export default router;
