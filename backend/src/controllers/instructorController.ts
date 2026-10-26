import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma";
import { classService } from "../services/classService";
import { sendSuccess } from "../utils/apiResponse";
import { ClassStatus, Role } from "../types/enums";

export class InstructorController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.user!.id;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // 1. Live class
      const liveClass = await prisma.classSession.findFirst({
        where: { instructorId, status: ClassStatus.LIVE },
        include: {
          course: { select: { title: true, code: true } },
          batch: { select: { name: true } },
          _count: { select: { attendances: true } },
        },
      });

      // 2. Today's classes
      const todayClasses = await prisma.classSession.findMany({
        where: {
          instructorId,
          startTime: { gte: todayStart, lte: todayEnd },
        },
        orderBy: { startTime: "asc" },
        include: {
          course: { select: { title: true, code: true } },
          batch: { select: { name: true } },
        },
      });

      // 3. Upcoming classes
      const upcomingClasses = await prisma.classSession.findMany({
        where: {
          instructorId,
          status: ClassStatus.SCHEDULED,
          startTime: { gt: new Date() },
        },
        orderBy: { startTime: "asc" },
        take: 5,
        include: {
          course: { select: { title: true, code: true } },
          batch: { select: { name: true } },
        },
      });

      // 4. Assigned batches & student count
      const assignedBatches = await prisma.batch.findMany({
        where: { instructorId, status: "ACTIVE" },
        include: {
          course: { select: { title: true } },
          _count: { select: { enrollments: true } },
        },
      });

      const totalStudents = assignedBatches.reduce((acc, b) => acc + b._count.enrollments, 0);

      return sendSuccess(res, {
        liveClass,
        todayClasses,
        upcomingClasses,
        assignedBatches,
        totalStudents,
      });
    } catch (error) {
      next(error);
    }
  }

  async getClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.user!.id;
      const classes = await prisma.classSession.findMany({
        where: { instructorId },
        orderBy: { startTime: "desc" },
        include: {
          course: { select: { title: true, code: true } },
          batch: { select: { name: true } },
          recordings: { select: { id: true, status: true, expiresAt: true } },
          _count: { select: { attendances: true } },
        },
      });

      return sendSuccess(res, classes);
    } catch (error) {
      next(error);
    }
  }

  async getClassById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const instructorId = req.user!.id;

      const classSession = await prisma.classSession.findUnique({
        where: { id },
        include: {
          course: true,
          batch: {
            include: {
              enrollments: {
                include: {
                  student: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      studentProfile: { select: { registrationNumber: true } },
                    },
                  },
                },
              },
            },
          },
          recordings: true,
          attendances: {
            include: {
              student: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      if (!classSession || (req.user!.role !== Role.ADMIN && classSession.instructorId !== instructorId)) {
        return res.status(404).json({ success: false, message: "Class session not found" });
      }

      return sendSuccess(res, classSession);
    } catch (error) {
      next(error);
    }
  }

  async startClass(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await classService.startClass(id, req.user!.id, req.user!.role);
      return sendSuccess(res, result, "Class session started and classroom is now LIVE.");
    } catch (error) {
      next(error);
    }
  }

  async endClass(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await classService.endClass(id, req.user!.id, req.user!.role);
      return sendSuccess(res, result, "Class session ended successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const instructorController = new InstructorController();
export default instructorController;
