import crypto from "crypto";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { Role, UserStatus } from "../types/enums";
import { NotFoundError, ConflictError } from "../utils/errors";

export class UserService {
  async getStudents(params: {
    page?: number;
    limit?: number;
    search?: string;
    batchId?: string;
    status?: UserStatus;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: Role.STUDENT,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.batchId) {
      where.enrollments = {
        some: { batchId: params.batchId },
      };
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
        {
          studentProfile: {
            registrationNumber: { contains: params.search },
          },
        },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          studentProfile: true,
          enrollments: {
            include: {
              batch: { select: { id: true, name: true } },
              course: { select: { id: true, title: true, code: true } },
            },
          },
          _count: {
            select: { attendances: true },
          },
        },
      }),
    ]);

    return {
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInstructors(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: UserStatus;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: Role.INSTRUCTOR,
    };

    if (params.status) where.status = params.status;

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        {
          instructorProfile: {
            specialization: { contains: params.search },
          },
        },
      ];
    }

    const [total, instructors] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          instructorProfile: true,
          assignedBatches: {
            select: { id: true, name: true, course: { select: { title: true } } },
          },
          _count: {
            select: { taughtClasses: true },
          },
        },
      }),
    ]);

    return {
      instructors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createInstructor(data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    specialization?: string;
    bio?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictError("User with this email already exists.");
    }

    // No shared default password: generate a one-time password the admin hands over
    const temporaryPassword = data.password ? undefined : `Id${crypto.randomBytes(6).toString("hex")}9A`;
    const passwordHash = await bcrypt.hash(data.password || temporaryPassword!, 12);
    const employeeId = `INS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: Role.INSTRUCTOR,
        instructorProfile: {
          create: {
            employeeId,
            specialization: data.specialization || null,
            bio: data.bio,
          },
        },
      },
      select: { id: true, name: true, email: true, phone: true, role: true, instructorProfile: true },
    });

    return { ...user, temporaryPassword };
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    return prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }
}

export const userService = new UserService();
export default userService;
