import { prisma } from "./prisma";
import { AttendanceStatus } from "../types/enums";
import { logger } from "../utils/logger";

export class AttendanceService {
  /**
   * Records student joining classroom
   */
  async recordJoin(classSessionId: string, studentId: string) {
    try {
      const attendance = await prisma.attendance.upsert({
        where: {
          classSessionId_studentId: { classSessionId, studentId },
        },
        create: {
          classSessionId,
          studentId,
          joinedAt: new Date(),
          status: AttendanceStatus.PRESENT,
        },
        update: {
          // If rejoined, retain earliest join or update
          status: AttendanceStatus.PRESENT,
        },
      });
      return attendance;
    } catch (error) {
      logger.error("Failed to record attendance join", error);
      return null;
    }
  }

  /**
   * Records student leaving classroom and calculates duration
   */
  async recordLeave(classSessionId: string, studentId: string) {
    try {
      const attendance = await prisma.attendance.findUnique({
        where: {
          classSessionId_studentId: { classSessionId, studentId },
        },
      });

      if (!attendance) return null;

      const leftAt = new Date();
      const durationSeconds = Math.round((leftAt.getTime() - attendance.joinedAt.getTime()) / 1000);

      return await prisma.attendance.update({
        where: {
          classSessionId_studentId: { classSessionId, studentId },
        },
        data: {
          leftAt,
          durationSeconds: Math.max(durationSeconds, attendance.durationSeconds),
        },
      });
    } catch (error) {
      logger.error("Failed to record attendance leave", error);
      return null;
    }
  }

  /**
   * Calculates actual attendance percentage for a student based on real completed classes
   */
  async getStudentAttendanceStats(studentId: string) {
    // 1. Get all batches student is actively enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      select: { batchId: true },
    });

    const batchIds = enrollments.map((e) => e.batchId);
    if (batchIds.length === 0) {
      return { totalClasses: 0, attendedClasses: 0, attendanceRate: 0 };
    }

    // 2. Count completed classes in those batches
    const completedClasses = await prisma.classSession.count({
      where: {
        batchId: { in: batchIds },
        status: "COMPLETED",
      },
    });

    if (completedClasses === 0) {
      return { totalClasses: 0, attendedClasses: 0, attendanceRate: 100 };
    }

    // 3. Count attended classes
    const attendedCount = await prisma.attendance.count({
      where: {
        studentId,
        classSession: { status: "COMPLETED" },
        status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.PARTIAL] },
      },
    });

    const attendanceRate = Math.round((attendedCount / completedClasses) * 100);

    return {
      totalClasses: completedClasses,
      attendedClasses: attendedCount,
      attendanceRate,
    };
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
