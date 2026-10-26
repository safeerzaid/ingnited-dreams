import { prisma } from "./prisma";
import { storageService } from "./storageService";
import { settingService } from "./settingService";
import { notificationService } from "./notificationService";
import { auditService } from "./auditService";
import {
  NotFoundError,
  ForbiddenError,
  RecordingExpiredError,
  BadRequestError,
} from "../utils/errors";
import { logger } from "../utils/logger";
import { RecordingStatus, Role } from "../types/enums";

export class RecordingService {
  /**
   * Initializes a recording entry when class starts
   */
  async initializeRecording(classSessionId: string) {
    const classSession = await prisma.classSession.findUnique({
      where: { id: classSessionId },
      include: { course: true, batch: true },
    });

    if (!classSession) {
      throw new NotFoundError("Class session not found");
    }

    const fileName = `${classSession.course.code}_${classSession.batch.name.replace(/\s+/g, "-")}_${classSession.title.replace(/\s+/g, "-")}_${Date.now()}.mp4`;
    const storageKey = `recordings/${classSession.courseId}/${classSession.batchId}/${classSession.id}/${fileName}`;

    const recording = await prisma.recording.create({
      data: {
        classSessionId,
        provider: "LIVEKIT_EGRESS",
        storageProvider: "CLOUDFLARE_R2",
        storageKey,
        fileName,
        mimeType: "video/mp4",
        status: RecordingStatus.RECORDING,
      },
    });

    return recording;
  }

  /**
   * Transitions recording to READY when LiveKit egress upload completes to Cloudflare R2
   * Strictly calculates expiresAt = availableAt + retentionDays (7 days default)
   */
  async markRecordingReady(params: {
    recordingId?: string;
    externalRecordingId?: string;
    storageKey?: string;
    fileSize?: bigint;
    durationSeconds?: number;
  }) {
    let recording = null;

    if (params.recordingId) {
      recording = await prisma.recording.findUnique({
        where: { id: params.recordingId },
        include: { classSession: true },
      });
    } else if (params.externalRecordingId) {
      recording = await prisma.recording.findFirst({
        where: { externalRecordingId: params.externalRecordingId },
        include: { classSession: true },
      });
    } else if (params.storageKey) {
      recording = await prisma.recording.findFirst({
        where: { storageKey: params.storageKey },
        include: { classSession: true },
      });
    }

    if (!recording) {
      logger.warn("Recording not found to mark ready", params);
      return null;
    }

    // Get centralized retention days (7 days default)
    const retentionDays = await settingService.getRecordingRetentionDays();
    const availableAt = new Date();
    const expiresAt = new Date(availableAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.recording.update({
      where: { id: recording.id },
      data: {
        status: RecordingStatus.READY,
        availableAt,
        expiresAt,
        fileSize: params.fileSize || recording.fileSize,
        durationSeconds: params.durationSeconds || recording.durationSeconds,
      },
    });

    logger.info(`Recording ${updated.id} is now READY. Expiration set to: ${expiresAt.toISOString()} (${retentionDays} days)`);

    // Notify enrolled students that recording is ready to watch & download
    await notificationService.notifyBatchStudents(
      recording.classSession.batchId,
      "RECORDING_READY",
      "New Class Recording Available",
      `The recording for "${recording.classSession.title}" is ready. Watch or download before it expires on ${expiresAt.toLocaleDateString("en-IN")}.`,
      `/student/recordings/${recording.id}`
    );

    return updated;
  }

  /**
   * Authorizes student access and generates short-lived signed R2 playback URL
   * Enforces strict server-side 7-day expiry!
   */
  async getStudentPlaybackUrl(recordingId: string, user: { id: string; role: Role }) {
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        classSession: {
          include: {
            batch: true,
            course: true,
            instructor: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!recording) {
      throw new NotFoundError("Recording not found");
    }

    const isAdmin = user.role === Role.ADMIN;

    if (recording.status === RecordingStatus.DELETED || recording.status === RecordingStatus.DELETING) {
      throw new RecordingExpiredError("This recording has been permanently deleted.");
    }

    // 1. Check server-side 7-day expiration rule (admins can still review archived recordings)
    const now = new Date();
    if (!isAdmin && recording.expiresAt && now >= recording.expiresAt) {
      // Mark as EXPIRED in DB if not already
      if (recording.status === RecordingStatus.READY || recording.status === RecordingStatus.EXPIRING_SOON) {
        await prisma.recording.update({
          where: { id: recording.id },
          data: { status: RecordingStatus.EXPIRED },
        });
      }
      throw new RecordingExpiredError();
    }

    const playableStatuses: string[] = [RecordingStatus.READY, RecordingStatus.EXPIRING_SOON];
    if (isAdmin) playableStatuses.push(RecordingStatus.EXPIRED, RecordingStatus.ARCHIVED);

    if (!playableStatuses.includes(recording.status)) {
      if (recording.status === RecordingStatus.EXPIRED || recording.status === RecordingStatus.ARCHIVED) {
        throw new RecordingExpiredError();
      }
      throw new BadRequestError(`Recording is not available for playback. Current status: ${recording.status}`);
    }

    if (!isAdmin && !recording.playbackEnabled) {
      throw new ForbiddenError("Playback has been disabled for this recording.");
    }

    // 2. Authorization check: If user is a student, ensure active enrollment in the batch
    if (user.role === Role.STUDENT) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_batchId: {
            studentId: user.id,
            batchId: recording.classSession.batchId,
          },
        },
      });

      if (!enrollment || enrollment.status !== "ACTIVE") {
        throw new ForbiddenError("You are not enrolled in the course batch associated with this recording.");
      }
    } else if (user.role === Role.INSTRUCTOR) {
      // Instructor must teach this class or belong to batch
      if (recording.classSession.instructorId !== user.id) {
        throw new ForbiddenError("You are not the designated instructor for this class session.");
      }
    }

    if (!recording.storageKey) {
      throw new NotFoundError("Recording media storage key is missing.");
    }

    // 3. Generate short-lived signed R2 URL (15 minutes expiry)
    const playbackUrl = await storageService.getPlaybackUrl(recording.storageKey, 900);

    return {
      playbackUrl,
      expiresInSeconds: 900,
      recording: {
        id: recording.id,
        title: recording.classSession.title,
        courseTitle: recording.classSession.course.title,
        batchName: recording.classSession.batch.name,
        instructorName: recording.classSession.instructor.name,
        durationSeconds: recording.durationSeconds,
        availableAt: recording.availableAt,
        expiresAt: recording.expiresAt,
        status: recording.status,
        downloadEnabled: recording.downloadEnabled,
      },
    };
  }

  /**
   * Authorizes student download and generates short-lived signed R2 download URL
   * Enforces server-side expiry and logs download event
   */
  async getStudentDownloadUrl(
    recordingId: string,
    user: { id: string; role: Role },
    ipAddress?: string
  ) {
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        classSession: {
          include: { batch: true, course: true },
        },
      },
    });

    if (!recording) {
      throw new NotFoundError("Recording not found");
    }

    const isAdmin = user.role === Role.ADMIN;

    if (recording.status === RecordingStatus.DELETED || recording.status === RecordingStatus.DELETING) {
      throw new RecordingExpiredError("This recording has been permanently deleted.");
    }

    // Check expiration (admins can download archived recordings for the long-term vault)
    const now = new Date();
    if (!isAdmin) {
      if (recording.expiresAt && now >= recording.expiresAt) {
        throw new RecordingExpiredError();
      }
      if (recording.status !== RecordingStatus.READY && recording.status !== RecordingStatus.EXPIRING_SOON) {
        if (recording.status === RecordingStatus.EXPIRED || recording.status === RecordingStatus.ARCHIVED) {
          throw new RecordingExpiredError();
        }
        throw new BadRequestError(`Recording is not available for download. Current status: ${recording.status}`);
      }
    }

    if (!isAdmin && !recording.downloadEnabled) {
      throw new ForbiddenError("Download is disabled for this recording.");
    }

    // Check enrollment for student
    if (user.role === Role.STUDENT) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_batchId: {
            studentId: user.id,
            batchId: recording.classSession.batchId,
          },
        },
      });

      if (!enrollment || enrollment.status !== "ACTIVE") {
        throw new ForbiddenError("You are not enrolled in the course batch associated with this recording.");
      }
    } else if (user.role === Role.INSTRUCTOR && recording.classSession.instructorId !== user.id) {
      throw new ForbiddenError("You are not the designated instructor for this class session.");
    }

    if (!recording.storageKey) {
      throw new NotFoundError("Recording media storage key is missing.");
    }

    // Generate short-lived signed download URL (5 minutes)
    const downloadUrl = await storageService.getDownloadUrl(
      recording.storageKey,
      recording.fileName,
      300
    );

    // Track download in DownloadLog
    try {
      await prisma.downloadLog.create({
        data: {
          recordingId: recording.id,
          studentId: user.id,
          ipAddress,
        },
      });
    } catch (e) {
      logger.error("Failed to log recording download event", e);
    }

    return {
      downloadUrl,
      fileName: recording.fileName,
      expiresInSeconds: 300,
    };
  }

  /**
   * Admin manual deletion of a recording (Destructive action with confirmation)
   */
  async adminDeleteRecording(recordingId: string, adminId: string, reason: string, ipAddress?: string) {
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: { classSession: true },
    });

    if (!recording) {
      throw new NotFoundError("Recording not found");
    }

    // 1. Delete actual object in Cloudflare R2 if it exists
    if (recording.storageKey) {
      try {
        await storageService.deleteObject(recording.storageKey);
      } catch (err) {
        logger.error(`Storage deletion failed for recording ${recordingId}`, err);
        throw new BadRequestError("Failed to delete recording file from R2 storage. Database was not modified.");
      }
    }

    // 2. Update PostgreSQL metadata
    const updated = await prisma.recording.update({
      where: { id: recordingId },
      data: {
        status: RecordingStatus.DELETED,
        deletedAt: new Date(),
        playbackEnabled: false,
        downloadEnabled: false,
      },
    });

    // 3. Write structured audit log
    await auditService.log({
      actorId: adminId,
      action: "RECORDING_MANUAL_DELETE",
      entity: "Recording",
      entityId: recordingId,
      metadata: {
        classTitle: recording.classSession.title,
        reason,
        storageKey: recording.storageKey,
      },
      ipAddress,
    });

    return updated;
  }

  /**
   * Admin expiry extension (e.g. extending by 7 more days)
   */
  async adminExtendExpiry(
    recordingId: string,
    additionalDays: number,
    adminId: string,
    reason?: string,
    ipAddress?: string
  ) {
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: { classSession: true },
    });

    if (!recording) {
      throw new NotFoundError("Recording not found");
    }

    const baseDate = recording.expiresAt && recording.expiresAt > new Date() ? recording.expiresAt : new Date();
    const newExpiresAt = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.recording.update({
      where: { id: recordingId },
      data: {
        expiresAt: newExpiresAt,
        archiveExpiresAt: null,
        status: RecordingStatus.READY,
        playbackEnabled: true,
      },
    });

    await auditService.log({
      actorId: adminId,
      action: "RECORDING_EXPIRY_EXTENDED",
      entity: "Recording",
      entityId: recordingId,
      metadata: {
        previousExpiry: recording.expiresAt,
        newExpiresAt,
        additionalDays,
        reason,
      },
      ipAddress,
    });

    return updated;
  }
}

export const recordingService = new RecordingService();
export default recordingService;
