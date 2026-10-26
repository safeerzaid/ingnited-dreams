import crypto from "crypto";
import { prisma } from "./prisma";
import { storageService } from "./storageService";
import { auditService } from "./auditService";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors";
import { Role } from "../types/enums";

export const LIBRARY_MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

export const LIBRARY_ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/epub+zip": "epub",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/zip": "zip",
};

const PUBLIC_SELECT = {
  id: true,
  title: true,
  subtitle: true,
  category: true,
  author: true,
  description: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  createdAt: true,
  course: { select: { id: true, title: true, code: true } },
} as const;

export class LibraryService {
  /** Catalogue shown to visitors (no file access) */
  async getPublicCatalogue() {
    return prisma.libraryResource.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: PUBLIC_SELECT,
    });
  }

  /** Resources an enrolled student can open: academy-wide ones plus those of their courses */
  async getStudentResources(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      select: { courseId: true },
    });
    if (enrollments.length === 0) return { enrolled: false, resources: [] };

    const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
    const resources = await prisma.libraryResource.findMany({
      where: {
        published: true,
        OR: [{ courseId: null }, { courseId: { in: courseIds } }],
      },
      orderBy: { createdAt: "desc" },
      select: PUBLIC_SELECT,
    });
    return { enrolled: true, resources };
  }

  async getFileUrl(resourceId: string, user: { id: string; role: Role }, inline: boolean) {
    const resource = await prisma.libraryResource.findUnique({ where: { id: resourceId } });
    if (!resource || (!resource.published && user.role !== Role.ADMIN)) {
      throw new NotFoundError("Library resource not found.");
    }

    if (user.role === Role.STUDENT) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: user.id,
          status: "ACTIVE",
          ...(resource.courseId ? { courseId: resource.courseId } : {}),
        },
      });
      if (!enrollment) {
        throw new ForbiddenError("This resource is available to enrolled students of the course only.");
      }
    }

    const url = inline
      ? await storageService.getPlaybackUrl(resource.storageKey, 600)
      : await storageService.getDownloadUrl(resource.storageKey, resource.fileName, 300, resource.mimeType);

    return { url, fileName: resource.fileName, expiresInSeconds: inline ? 600 : 300 };
  }

  async getAdminResources() {
    return prisma.libraryResource.findMany({
      orderBy: { createdAt: "desc" },
      include: { course: { select: { id: true, title: true, code: true } } },
    });
  }

  async createResource(
    adminId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    data: { title: string; subtitle?: string; category: string; author?: string; description?: string; courseId?: string },
    ipAddress?: string
  ) {
    if (!LIBRARY_ALLOWED_TYPES[file.mimetype]) {
      throw new BadRequestError("Unsupported file type. Upload a PDF, EPUB, DOCX, PPTX, XLSX or ZIP file.");
    }
    if (data.courseId) {
      const course = await prisma.course.findUnique({ where: { id: data.courseId } });
      if (!course) throw new BadRequestError("Selected course does not exist.");
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(-120);
    const storageKey = `library/${crypto.randomBytes(8).toString("hex")}/${safeName}`;
    await storageService.uploadObject(storageKey, file.buffer, file.mimetype);

    const resource = await prisma.libraryResource.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        category: data.category,
        author: data.author || null,
        description: data.description || null,
        courseId: data.courseId || null,
        storageKey,
        fileName: safeName,
        mimeType: file.mimetype,
        fileSize: file.size,
      },
    });

    await auditService.log({
      actorId: adminId,
      action: "LIBRARY_RESOURCE_UPLOADED",
      entity: "LibraryResource",
      entityId: resource.id,
      metadata: { title: resource.title, fileName: safeName, fileSize: file.size },
      ipAddress,
    });

    return resource;
  }

  async updateResource(id: string, data: Partial<{ title: string; subtitle: string; category: string; author: string; description: string; published: boolean }>) {
    const resource = await prisma.libraryResource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundError("Library resource not found.");
    return prisma.libraryResource.update({ where: { id }, data });
  }

  async deleteResource(id: string, adminId: string, ipAddress?: string) {
    const resource = await prisma.libraryResource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundError("Library resource not found.");

    await storageService.deleteObject(resource.storageKey);
    await prisma.libraryResource.delete({ where: { id } });

    await auditService.log({
      actorId: adminId,
      action: "LIBRARY_RESOURCE_DELETED",
      entity: "LibraryResource",
      entityId: id,
      metadata: { title: resource.title, storageKey: resource.storageKey },
      ipAddress,
    });
  }
}

export const libraryService = new LibraryService();
export default libraryService;
