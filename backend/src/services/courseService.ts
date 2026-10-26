import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import { CourseStatus } from "../types/enums";
import { NotFoundError, ConflictError } from "../utils/errors";

export interface SyllabusModule {
  name: string;
  hours?: string;
  topics?: string;
}

function parseSyllabus(raw: string | null): SyllabusModule[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const PUBLIC_BATCH_SELECT = {
  id: true,
  name: true,
  code: true,
  startDate: true,
  endDate: true,
  status: true,
  capacity: true,
  scheduleLabel: true,
  instructor: { select: { id: true, name: true } },
  _count: { select: { enrollments: { where: { status: "ACTIVE" } } } },
} as const;

type PublicBatchRow = {
  capacity: number;
  _count: { enrollments: number };
  [key: string]: unknown;
};

function withSeats<T extends PublicBatchRow>(batch: T) {
  const { _count, ...rest } = batch;
  return { ...rest, seatsTaken: _count.enrollments, seatsLeft: Math.max(0, batch.capacity - _count.enrollments) };
}

export class CourseService {
  /**
   * Public list of published courses
   */
  async getPublishedCourses() {
    const courses = await prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        code: true,
        description: true,
        thumbnail: true,
        durationHours: true,
        durationLabel: true,
        price: true,
        marketPrice: true,
        category: true,
        level: true,
        facultyName: true,
        facultyTitle: true,
        batches: {
          where: { status: { in: ["ACTIVE", "UPCOMING"] } },
          orderBy: { startDate: "asc" },
          select: PUBLIC_BATCH_SELECT,
        },
      },
    });

    return courses.map((c) => ({ ...c, batches: c.batches.map(withSeats) }));
  }

  /**
   * Public course details by slug
   */
  async getCourseBySlug(slug: string) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        batches: {
          where: { status: { in: ["ACTIVE", "UPCOMING"] } },
          orderBy: { startDate: "asc" },
          select: PUBLIC_BATCH_SELECT,
        },
      },
    });

    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundError(`Course with slug "${slug}" not found.`);
    }

    return {
      ...course,
      syllabus: parseSyllabus(course.syllabus),
      batches: course.batches.map(withSeats),
    };
  }

  /**
   * Admin course list with pagination and search
   */
  async getAdminCourses(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CourseStatus;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { code: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { batches: true, enrollments: true, classSessions: true },
          },
        },
      }),
    ]);

    return {
      courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create course
   */
  async createCourse(data: Prisma.CourseCreateInput) {
    const existing = await prisma.course.findFirst({
      where: {
        OR: [{ slug: data.slug }, { code: data.code }],
      },
    });

    if (existing) {
      throw new ConflictError("Course with this slug or code already exists.");
    }

    return prisma.course.create({ data });
  }

  /**
   * Update course
   */
  async updateCourse(id: string, data: Partial<Prisma.CourseUpdateInput>) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");

    return prisma.course.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete course
   */
  async deleteCourse(id: string) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundError("Course not found");

    return prisma.course.delete({ where: { id } });
  }
}

export const courseService = new CourseService();
export default courseService;
