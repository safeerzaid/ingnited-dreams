import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { libraryController, libraryUpload } from "../controllers/libraryController";
import { authenticateUser, requireRole } from "../middleware/auth";
import { Role } from "../types/enums";

const router = Router();

router.use(authenticateUser, requireRole([Role.ADMIN]));

router.get("/dashboard", adminController.getDashboard);

// Students
router.get("/students", adminController.getStudents);
router.patch("/students/:id/status", adminController.updateStudentStatus);

// Instructors
router.get("/instructors", adminController.getInstructors);
router.post("/instructors", adminController.createInstructor);

// Courses
router.get("/courses", adminController.getCourses);
router.post("/courses", adminController.createCourse);
router.patch("/courses/:id", adminController.updateCourse);

// Batches
router.get("/batches", adminController.getBatches);
router.post("/batches", adminController.createBatch);
router.post("/batches/enroll", adminController.assignStudent);
router.patch("/batches/:id", adminController.updateBatch);

// Classes
router.get("/classes", adminController.getClasses);
router.post("/classes", adminController.createClass);
router.patch("/classes/:id", adminController.updateClass);

// Recordings Management
router.get("/recordings", adminController.getRecordings);
router.delete("/recordings/:id", adminController.deleteRecording);
router.patch("/recordings/:id/expiry", adminController.extendRecordingExpiry);

// System
router.get("/settings", adminController.getSettings);
router.patch("/settings", adminController.updateSettings);
router.post("/inauguration/reset", adminController.resetInauguration);
router.get("/audit-logs", adminController.getAuditLogs);

// Payments & enquiries
router.get("/payments", adminController.getPayments);
router.get("/inquiries", adminController.getInquiries);
router.patch("/inquiries/:id", adminController.updateInquiry);

// Library (uploads go to Cloudflare R2)
router.get("/library", libraryController.getAdminResources);
router.post("/library", libraryUpload, libraryController.createResource);
router.patch("/library/:id", libraryController.updateResource);
router.delete("/library/:id", libraryController.deleteResource);
router.get("/library/:id/file", libraryController.getFileUrl);

export default router;
