import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { attendanceService } from "../services/attendanceService";
import { notificationService } from "../services/notificationService";
import { sendSuccess } from "../utils/apiResponse";
import { RecordingStatus, ClassStatus } from "../types/enums";

export class StudentController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;

      // 1. Get student enrolled batches
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId, status: "ACTIVE" },
        include: {
          course: true,
          batch: {
            include: { instructor: { select: { id: true, name: true } } },
          },
        },
      });

      const batchIds = enrollments.map((e) => e.batchId);

      // 2. Check for any LIVE classes in student's batches
      const liveClasses = await prisma.classSession.findMany({
        where: {
          batchId: { in: batchIds },
          status: ClassStatus.LIVE,
        },
        include: {
          course: { select: { id: true, title: true, code: true } },
          batch: { select: { id: true, name: true } },
          instructor: { select: { id: true, name: true } },
        },
      });

      // 3. Upcoming scheduled classes (next 7 days)
      const upcomingClasses = await prisma.classSession.findMany({
        where: {
          batchId: { in: batchIds },
          status: ClassStatus.SCHEDULED,
          startTime: { gte: new Date() },
        },
        orderBy: { startTime: "asc" },
        take: 5,
        include: {
          course: { select: { id: true, title: true, code: true } },
          batch: { select: { id: true, name: true } },
          instructor: { select: { id: true, name: true } },
        },
      });

      // 4. Recent READY recordings (available to student and not yet expired)
      const now = new Date();
      const recentRecordings = await prisma.recording.findMany({
        where: {
          status: { in: [RecordingStatus.READY, RecordingStatus.EXPIRING_SOON] },
          expiresAt: { gt: now },
          classSession: { batchId: { in: batchIds } },
        },
        orderBy: { availableAt: "desc" },
        take: 6,
        include: {
          classSession: {
            include: {
              course: { select: { id: true, title: true, code: true } },
              batch: { select: { id: true, name: true } },
              instructor: { select: { id: true, name: true } },
            },
          },
        },
      });

      // 5. Attendance stats
      const attendanceStats = await attendanceService.getStudentAttendanceStats(studentId);

      // 6. Unread notifications count
      const unreadNotifications = await prisma.notification.count({
        where: { userId: studentId, read: false },
      });

      return sendSuccess(res, {
        student: {
          id: req.user!.id,
          name: req.user!.name,
          email: req.user!.email,
        },
        liveNow: liveClasses.length > 0 ? liveClasses[0] : null,
        upcomingClasses,
        recentRecordings: recentRecordings.map((r) => {
          const hoursRemaining = r.expiresAt
            ? Math.max(0, Math.round((r.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
            : null;
          return {
            id: r.id,
            title: r.classSession.title,
            courseTitle: r.classSession.course.title,
            batchName: r.classSession.batch.name,
            instructorName: r.classSession.instructor.name,
            durationSeconds: r.durationSeconds,
            availableAt: r.availableAt,
            expiresAt: r.expiresAt,
            hoursRemaining,
            status: r.status,
            downloadEnabled: r.downloadEnabled,
          };
        }),
        enrollments: enrollments.map((e) => ({
          id: e.id,
          course: e.course,
          batch: e.batch,
          enrolledAt: e.enrolledAt,
        })),
        attendance: attendanceStats,
        unreadNotifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: true,
          batch: {
            include: {
              instructor: { select: { id: true, name: true, email: true } },
              _count: { select: { classSessions: true } },
            },
          },
        },
      });

      return sendSuccess(res, enrollments);
    } catch (error) {
      next(error);
    }
  }

  async getRecordings(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const { search, courseId, page = "1", limit = "12" } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 12;
      const skip = (pageNum - 1) * limitNum;

      // Get enrolled batches
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId, status: "ACTIVE" },
        select: { batchId: true },
      });
      const batchIds = enrollments.map((e) => e.batchId);

      const now = new Date();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        classSession: {
          batchId: { in: batchIds },
        },
      };

      if (courseId) {
        where.classSession.courseId = courseId;
      }

      if (search) {
        where.classSession.title = { contains: search as string, mode: "insensitive" };
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
          },
        }),
      ]);

      const formatted = recordings.map((r) => {
        const isExpired = r.expiresAt ? now >= r.expiresAt : false;
        const hoursRemaining =
          r.expiresAt && !isExpired
            ? Math.round((r.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
            : 0;

        return {
          id: r.id,
          title: r.classSession.title,
          courseTitle: r.classSession.course.title,
          batchName: r.classSession.batch.name,
          instructorName: r.classSession.instructor.name,
          durationSeconds: r.durationSeconds,
          fileSize: r.fileSize ? Number(r.fileSize) : null,
          status: isExpired ? RecordingStatus.EXPIRED : r.status,
          availableAt: r.availableAt,
          expiresAt: r.expiresAt,
          isExpired,
          hoursRemaining,
          downloadEnabled: r.downloadEnabled && !isExpired,
          playbackEnabled: r.playbackEnabled && !isExpired,
        };
      });

      return sendSuccess(res, {
        recordings: formatted,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const attendances = await prisma.attendance.findMany({
        where: { studentId },
        orderBy: { joinedAt: "desc" },
        include: {
          classSession: {
            include: {
              course: { select: { title: true, code: true } },
              batch: { select: { name: true } },
            },
          },
        },
      });

      const stats = await attendanceService.getStudentAttendanceStats(studentId);

      return sendSuccess(res, {
        stats,
        history: attendances,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.id;
      const notifications = await notificationService.getUserNotifications(studentId);
      return sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const studentId = req.user!.id;
      if (id === "all") {
        await notificationService.markAllAsRead(studentId);
      } else {
        await notificationService.markAsRead(id, studentId);
      }
      return sendSuccess(res, null, "Notification updated");
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
export default studentController;
