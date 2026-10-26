import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { BatchStatus } from "../types/enums";
import { NotFoundError, ConflictError } from "../utils/errors";

export class BatchService {
  async getBatches(params: {
    courseId?: string;
    instructorId?: string;
    status?: BatchStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BatchWhereInput = {};
    if (params.courseId) where.courseId = params.courseId;
    if (params.instructorId) where.instructorId = params.instructorId;
    if (params.status) where.status = params.status;

    const [total, batches] = await Promise.all([
      prisma.batch.count({ where }),
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
        include: {
          course: { select: { id: true, title: true, code: true } },
          instructor: { select: { id: true, name: true, email: true } },
          _count: {
            select: { enrollments: true, classSessions: true },
          },
        },
      }),
    ]);

    return {
      batches,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBatchById(id: string) {
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        course: true,
        instructor: { select: { id: true, name: true, email: true, phone: true } },
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
        classSessions: {
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!batch) {
      throw new NotFoundError("Batch not found");
    }

    return batch;
  }

  async createBatch(data: {
    name: string;
    code: string;
    courseId: string;
    instructorId: string;
    startDate: Date;
    endDate: Date;
    status?: BatchStatus;
    capacity?: number;
    scheduleLabel?: string;
  }) {
    const existing = await prisma.batch.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new ConflictError("Batch with this code already exists.");
    }

    return prisma.batch.create({
      data,
      include: {
        course: true,
        instructor: { select: { id: true, name: true } },
      },
    });
  }

  async updateBatch(
    id: string,
    data: Partial<{
      name: string;
      instructorId: string;
      startDate: Date;
      endDate: Date;
      status: BatchStatus;
      capacity: number;
      scheduleLabel: string;
    }>
  ) {
    const batch = await prisma.batch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundError("Batch not found");

    return prisma.batch.update({
      where: { id },
      data,
      include: {
        course: { select: { id: true, title: true, code: true } },
        instructor: { select: { id: true, name: true } },
      },
    });
  }

  async assignStudentToBatch(studentId: string, batchId: string, courseId: string) {
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_batchId: { studentId, batchId },
      },
    });

    if (existing) {
      throw new ConflictError("Student is already enrolled in this batch.");
    }

    return prisma.enrollment.create({
      data: {
        studentId,
        batchId,
        courseId,
        status: "ACTIVE",
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        batch: { select: { id: true, name: true } },
      },
    });
  }
}

export const batchService = new BatchService();
export default batchService;
