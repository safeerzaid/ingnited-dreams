import { prisma } from "./prisma";
import { storageService } from "./storageService";
import { auditService } from "./auditService";
import { notificationService } from "./notificationService";
import { logger } from "../utils/logger";
import { RecordingStatus } from "../types/enums";
import { config } from "../config";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Recording lifecycle:
 *   READY (students watch/download for 7 days)
 *     → ARCHIVED (student access closed, file kept in the private vault for ARCHIVE_RETENTION_DAYS, default 2 years)
 *     → DELETED (file removed from storage)
 */
export class CleanupService {
  private isRunning = false;

  /**
   * Hourly job: closes the student window on expired recordings and purges archives past their retention.
   */
  async cleanupExpiredRecordings(): Promise<{
    processed: number;
    archived: number;
    deleted: number;
    failed: number;
  }> {
    if (this.isRunning) {
      logger.warn("Cleanup job already running. Skipping this cycle.");
      return { processed: 0, archived: 0, deleted: 0, failed: 0 };
    }

    this.isRunning = true;
    const now = new Date();
    let archivedCount = 0;
    let deletedCount = 0;
    let failedCount = 0;

    logger.info(`Starting hourly recording lifecycle job at ${now.toISOString()}`);

    try {
      // 1. Student window over → move to archive (no storage change)
      const expiredRecordings = await prisma.recording.findMany({
        where: {
          expiresAt: { lte: now },
          status: {
            in: [RecordingStatus.READY, RecordingStatus.EXPIRING_SOON, RecordingStatus.EXPIRED],
          },
        },
        take: config.cleanup.batchSize,
        include: { classSession: { select: { title: true } } },
      });

      for (const recording of expiredRecordings) {
        const archiveExpiresAt = new Date(
          (recording.expiresAt ?? now).getTime() + config.academy.archiveRetentionDays * DAY_MS
        );
        await prisma.recording.update({
          where: { id: recording.id },
          data: { status: RecordingStatus.ARCHIVED, archiveExpiresAt },
        });
        await auditService.log({
          action: "RECORDING_ARCHIVED",
          entity: "Recording",
          entityId: recording.id,
          metadata: {
            classTitle: recording.classSession.title,
            studentAccessEndedAt: recording.expiresAt,
            archiveExpiresAt,
          },
        });
        archivedCount++;
      }

      // 2. Archive retention over → delete file from storage
      const purgeable = await prisma.recording.findMany({
        where: {
          status: RecordingStatus.ARCHIVED,
          archiveExpiresAt: { lte: now },
        },
        take: config.cleanup.batchSize,
        include: { classSession: { select: { title: true } } },
      });

      for (const recording of purgeable) {
        try {
          await prisma.recording.update({
            where: { id: recording.id },
            data: { status: RecordingStatus.DELETING },
          });

          if (recording.storageKey) {
            await storageService.deleteObject(recording.storageKey);
          }

          await prisma.recording.update({
            where: { id: recording.id },
            data: {
              status: RecordingStatus.DELETED,
              deletedAt: new Date(),
              playbackEnabled: false,
              downloadEnabled: false,
            },
          });

          await auditService.log({
            action: "RECORDING_ARCHIVE_PURGED",
            entity: "Recording",
            entityId: recording.id,
            metadata: {
              classSessionId: recording.classSessionId,
              classTitle: recording.classSession.title,
              storageKey: recording.storageKey,
              archiveExpiresAt: recording.archiveExpiresAt,
            },
          });

          deletedCount++;
          logger.info(`Purged archived recording: ${recording.id} (${recording.fileName})`);
        } catch (error) {
          failedCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`Failed to purge archived recording: ${recording.id}`, error);

          // Back to ARCHIVED so the next hourly run retries
          await prisma.recording.update({
            where: { id: recording.id },
            data: {
              status: RecordingStatus.ARCHIVED,
              retryCount: { increment: 1 },
              lastError: errorMessage,
            },
          });
        }
      }

      return {
        processed: expiredRecordings.length + purgeable.length,
        archived: archivedCount,
        deleted: deletedCount,
        failed: failedCount,
      };
    } catch (globalError) {
      logger.error("Unexpected error in cleanupExpiredRecordings job", globalError);
      return { processed: 0, archived: archivedCount, deleted: deletedCount, failed: failedCount };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Checks recordings nearing expiration (within 48h and 24h) and sends warning notifications to students
   */
  async checkExpiringSoonRecordings() {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    try {
      const expiringRecordings = await prisma.recording.findMany({
        where: {
          status: { in: [RecordingStatus.READY, RecordingStatus.EXPIRING_SOON] },
          expiresAt: {
            gt: now,
            lte: in48Hours,
          },
        },
        include: {
          classSession: { select: { title: true, batchId: true } },
        },
      });

      for (const rec of expiringRecordings) {
        if (!rec.expiresAt) continue;

        const hoursLeft = Math.round((rec.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

        // Mark as EXPIRING_SOON
        if (rec.status !== RecordingStatus.EXPIRING_SOON) {
          await prisma.recording.update({
            where: { id: rec.id },
            data: { status: RecordingStatus.EXPIRING_SOON },
          });
        }

        const warningTitle =
          hoursLeft <= 24
            ? "⚠️ Recording Expires Within 24 Hours!"
            : "⏳ Recording Expires Soon";

        const warningMsg = `Your access to the recording of "${rec.classSession.title}" ends in ${hoursLeft} hours. Download it now if you wish to keep a copy.`;

        await notificationService.notifyBatchStudents(
          rec.classSession.batchId,
          hoursLeft <= 24 ? "RECORDING_EXPIRING_24H" : "RECORDING_EXPIRING_48H",
          warningTitle,
          warningMsg,
          `/student/recordings/${rec.id}`
        );
      }
    } catch (error) {
      logger.error("Error in checkExpiringSoonRecordings", error);
    }
  }
}

export const cleanupService = new CleanupService();
export default cleanupService;
