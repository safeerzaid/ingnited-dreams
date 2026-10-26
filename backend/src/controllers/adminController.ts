import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { userService } from "../services/userService";
import { courseService } from "../services/courseService";
import { batchService } from "../services/batchService";
import { classService } from "../services/classService";
import { recordingService } from "../services/recordingService";
import { settingService } from "../services/settingService";
import { auditService } from "../services/auditService";
import { paymentService } from "../services/paymentService";
import { inquiryService } from "../services/inquiryService";
import { updateInquirySchema, createInstructorSchema } from "../validators/misc.validator";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validators/course.validator";
import {
  createBatchSchema,
  updateBatchSchema,
  assignEnrollmentSchema,
} from "../validators/batch.validator";
import {
  createClassSchema,
  updateClassSchema,
} from "../validators/class.validator";
import {
  extendRecordingExpirySchema,
  manualRecordingDeleteSchema,
} from "../validators/recording.validator";
import { updateSettingsSchema } from "../validators/setting.validator";
import { sendSuccess } from "../utils/apiResponse";
import { Prisma } from "@prisma/client";
import { Role, ClassStatus, RecordingStatus } from "../types/enums";

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // Real database queries - no fake statistics!
      const [
        totalStudents,
        activeInstructors,
        activeCourses,
        upcomingClasses,
        liveClasses,
        readyRecordings,
        expiringRecordings,
        storageAggregate,
        recentAudits,
        revenueAggregate,
        openInquiries,
      ] = await Promise.all([
        prisma.user.count({ where: { role: Role.STUDENT, status: "ACTIVE" } }),
        prisma.user.count({ where: { role: Role.INSTRUCTOR, status: "ACTIVE" } }),
        prisma.course.count({ where: { status: "PUBLISHED" } }),
        prisma.classSession.count({
          where: { status: ClassStatus.SCHEDULED, startTime: { gte: now } },
        }),
        prisma.classSession.count({ where: { status: ClassStatus.LIVE } }),
        prisma.recording.count({
          where: {
            status: { in: [RecordingStatus.READY, RecordingStatus.EXPIRING_SOON] },
            expiresAt: { gt: now },
          },
        }),
        prisma.recording.count({
          where: {
            status: { in: [RecordingStatus.READY, RecordingStatus.EXPIRING_SOON] },
            expiresAt: { gt: now, lte: in48Hours },
          },
        }),
        // Storage includes the 2-year archive (files still in R2)
        prisma.recording.aggregate({
          _sum: { fileSize: true },
          where: {
            status: {
              in: [RecordingStatus.READY, RecordingStatus.EXPIRING_SOON, RecordingStatus.EXPIRED, RecordingStatus.ARCHIVED],
            },
          },
        }),
        prisma.auditLog.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true, role: true } } },
        }),
        prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
        prisma.contactInquiry.count({ where: { status: "NEW" } }),
      ]);

      const totalStorageBytes = storageAggregate._sum.fileSize
        ? Number(storageAggregate._sum.fileSize)
        : 0;

      return sendSuccess(res, {
        metrics: {
          totalStudents,
          activeInstructors,
          activeCourses,
          upcomingClasses,
          liveClasses,
          readyRecordings,
          expiringRecordings,
          totalStorageBytes,
          storageMb: (totalStorageBytes / (1024 * 1024)).toFixed(2),
          paidAdmissions: revenueAggregate._count,
          revenuePaise: revenueAggregate._sum.amount || 0,
          openInquiries,
        },
        recentAudits,
      });
    } catch (error) {
      next(error);
    }
  }

  // STUDENTS
  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, batchId, status } = req.query;
      const result = await userService.getStudents({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        search: search as string,
        batchId: batchId as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any,
      });
      return sendSuccess(res, result.students, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStudentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { status } = req.body;
      const updated = await userService.updateUserStatus(id, status);
      return sendSuccess(res, updated, `Student status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  // INSTRUCTORS
  async getInstructors(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await userService.getInstructors({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        search: search as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any,
      });
      return sendSuccess(res, result.instructors, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async createInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.createInstructor(createInstructorSchema.parse(req.body));
      return sendSuccess(res, result, "Instructor account created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  // COURSES
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await courseService.getAdminCourses({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        search: search as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any,
      });
      return sendSuccess(res, result.courses, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCourseSchema.parse(req.body);
      const course = await courseService.createCourse(validated);
      return sendSuccess(res, course, "Course created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const validated = updateCourseSchema.parse(req.body);
      const course = await courseService.updateCourse(id, validated);
      return sendSuccess(res, course, "Course updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // BATCHES
  async getBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, courseId, instructorId, status } = req.query;
      const result = await batchService.getBatches({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        courseId: courseId as string,
        instructorId: instructorId as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any,
      });
      return sendSuccess(res, result.batches, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createBatchSchema.parse(req.body);
      const batch = await batchService.createBatch({
        ...validated,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      });
      return sendSuccess(res, batch, "Batch created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      // courseId/code are fixed once created (payments and enrollments reference them)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { courseId, code, startDate, endDate, ...rest } = updateBatchSchema.parse(req.body);
      const batch = await batchService.updateBatch(id, {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      });
      return sendSuccess(res, batch, "Batch updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async assignStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = assignEnrollmentSchema.parse(req.body);
      const enrollment = await batchService.assignStudentToBatch(
        validated.studentId,
        validated.batchId,
        validated.courseId
      );
      return sendSuccess(res, enrollment, "Student enrolled in batch successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  // CLASSES
  async getClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, courseId, batchId, instructorId, status } = req.query;
      const result = await classService.getClasses({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        courseId: courseId as string,
        batchId: batchId as string,
        instructorId: instructorId as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: status as any,
      });
      return sendSuccess(res, result.classes, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createClassSchema.parse(req.body);
      const classSession = await classService.createClass({
        ...validated,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
      });
      return sendSuccess(res, classSession, "Class session scheduled successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateClassSchema.parse(req.body);
      const updated = await classService.updateClass(String(req.params.id), {
        ...validated,
        startTime: validated.startTime ? new Date(validated.startTime) : undefined,
        endTime: validated.endTime ? new Date(validated.endTime) : undefined,
      });
      return sendSuccess(res, updated, "Class updated");
    } catch (error) {
      next(error);
    }
  }

  // RECORDINGS MANAGEMENT
  async getRecordings(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, courseId, instructorId } = req.query;
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 20;
      const skip = (pageNum - 1) * limitNum;

      const where: Prisma.RecordingWhereInput = {};
      if (status) where.status = status as RecordingStatus;

      if (courseId || instructorId || search) {
        where.classSession = {};
        if (courseId) where.classSession.courseId = courseId as string;
        if (instructorId) where.classSession.instructorId = instructorId as string;
        if (search) {
          where.classSession.title = { contains: search as string };
        }
      }

      const [total, recordings] = await Promise.all([
        prisma.recording.count({ where }),
        prisma.recording.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          include: {
            classSession: {
              include: {
                course: { select: { id: true, title: true, code: true } },
                batch: { select: { id: true, name: true } },
                instructor: { select: { id: true, name: true } },
              },
            },
            _count: { select: { downloadLogs: true } },
          },
        }),
      ]);

      const now = new Date();
      const formatted = recordings.map((r) => {
        const isExpired = r.expiresAt ? now >= r.expiresAt : false;
        const hoursRemaining =
          r.expiresAt && !isExpired
            ? Math.round((r.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
            : 0;

        return {
          ...r,
          fileSize: r.fileSize ? Number(r.fileSize) : null,
          isExpired,
          hoursRemaining,
        };
      });

      return sendSuccess(res, formatted, undefined, 200, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecording(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const validated = manualRecordingDeleteSchema.parse(req.body);
      const result = await recordingService.adminDeleteRecording(
        id,
        req.user!.id,
        validated.reason,
        req.ip
      );
      return sendSuccess(res, result, "Recording permanently deleted from storage and marked as deleted.");
    } catch (error) {
      next(error);
    }
  }

  async extendRecordingExpiry(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const validated = extendRecordingExpirySchema.parse(req.body);
      const result = await recordingService.adminExtendExpiry(
        id,
        validated.additionalDays,
        req.user!.id,
        validated.reason,
        req.ip
      );
      return sendSuccess(res, result, `Recording expiration extended by ${validated.additionalDays} days.`);
    } catch (error) {
      next(error);
    }
  }

  // SETTINGS
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingService.getAllSettings();
      return sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateSettingsSchema.parse(req.body);

      for (const [key, value] of Object.entries(validated)) {
        if (value !== undefined) {
          await settingService.updateSetting(key, String(value));
        }
      }

      await auditService.log({
        actorId: req.user!.id,
        action: "SETTINGS_UPDATED",
        entity: "Setting",
        metadata: validated,
        ipAddress: req.ip,
      });

      const updated = await settingService.getAllSettings();
      return sendSuccess(res, updated, "Settings updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async resetInauguration(req: Request, res: Response, next: NextFunction) {
    try {
      await settingService.resetInauguration();
      await auditService.log({
        actorId: req.user!.id,
        action: "INAUGURATION_RESET",
        entity: "Setting",
        ipAddress: req.ip,
      });
      return sendSuccess(res, { inaugurated: false }, "Inauguration popup will show again on the next visit.");
    } catch (error) {
      next(error);
    }
  }

  // PAYMENTS
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await paymentService.getAdminPayments({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 25,
        status: status as string | undefined,
        search: search as string | undefined,
      });
      return sendSuccess(res, { payments: result.payments, summary: result.summary }, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  // CONTACT INQUIRIES
  async getInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query;
      const result = await inquiryService.list({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 25,
        status: status as string | undefined,
      });
      return sendSuccess(res, { inquiries: result.inquiries, openCount: result.openCount }, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateInquirySchema.parse(req.body);
      const updated = await inquiryService.updateStatus(String(req.params.id), status);
      return sendSuccess(res, updated, "Inquiry updated");
    } catch (error) {
      next(error);
    }
  }

  // AUDIT LOGS
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "50" } = req.query;
      const result = await auditService.getRecentLogs(
        parseInt(limit as string, 10),
        parseInt(page as string, 10)
      );
      return sendSuccess(res, result.logs, undefined, 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
export default adminController;
