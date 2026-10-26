import { Router } from "express";
import { publicController } from "../controllers/publicController";
import { libraryController } from "../controllers/libraryController";
import { publicFormLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get("/courses", publicController.getCourses);
router.get("/courses/:slug", publicController.getCourseBySlug);
router.get("/info", publicController.getInfo);
router.get("/library", libraryController.getPublicCatalogue);
router.post("/contact", publicFormLimiter, publicController.submitContact);
router.get("/inauguration", publicController.getInauguration);
router.post("/inauguration", publicFormLimiter, publicController.inaugurate);

export default router;
