import { Request, Response } from "express";
import { livekitService } from "../services/livekitService";
import { recordingService } from "../services/recordingService";
import { attendanceService } from "../services/attendanceService";
import { prisma } from "../services/prisma";
import { logger } from "../utils/logger";
import { RecordingStatus, Role } from "../types/enums";

function isStudentParticipant(metadata?: string) {
  try {
    return JSON.parse(metadata || "{}").role === Role.STUDENT;
  } catch {
    return false;
  }
}

export class WebhookController {
  async handleLiveKitWebhook(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const rawBody = req.rawBody?.toString("utf8");

      // 1. Verify webhook signature — unsigned events are rejected
      let event;
      try {
        if (!rawBody) throw new Error("Empty webhook body");
        event = await livekitService.receiveWebhook(rawBody, authHeader);
      } catch (verifyError) {
        logger.warn("Rejected LiveKit webhook: signature verification failed", verifyError);
        return res.status(401).json({ received: false, error: "Invalid webhook signature" });
      }

      const eventType = event.event;
      logger.info(`Received LiveKit webhook event: ${eventType}`);

      // 2. Handle events idempotently
      switch (eventType) {
        case "egress_ended": {
          const egressInfo = event.egressInfo;
          if (!egressInfo) break;

          const egressId = egressInfo.egressId;
          const status = egressInfo.status; // EGRESS_COMPLETE, EGRESS_FAILED, etc.
          const fileResults = egressInfo.fileResults?.[0];

          if (status === 3 || String(status).includes("COMPLETE")) {
            // Egress finished successfully and uploaded to Cloudflare R2
            logger.info(`LiveKit Egress ${egressId} completed successfully. Updating recording to READY.`);

            // size and duration arrive as bigint (duration in nanoseconds)
            const fileSize = fileResults?.size ? BigInt(fileResults.size) : undefined;
            const durationSeconds = fileResults?.duration
              ? Math.round(Number(fileResults.duration) / 1_000_000_000)
              : undefined;

            await recordingService.markRecordingReady({
              externalRecordingId: egressId,
              fileSize,
              durationSeconds,
            });
          } else if (status === 4 || String(status).includes("FAILED")) {
            logger.error(`LiveKit Egress ${egressId} failed with error: ${egressInfo.error}`);
            await prisma.recording.updateMany({
              where: { externalRecordingId: egressId },
              data: {
                status: RecordingStatus.FAILED,
                lastError: egressInfo.error || "Egress recording failed",
              },
            });
          }
          break;
        }

        case "participant_joined": {
          const participant = event.participant;
          const room = event.room;
          // Attendance is only tracked for students (instructors/admins join with other roles)
          if (participant?.identity && room?.name && isStudentParticipant(participant.metadata)) {
            const classSession = await prisma.classSession.findUnique({
              where: { roomName: room.name },
            });
            if (classSession) {
              await attendanceService.recordJoin(classSession.id, participant.identity);
            }
          }
          break;
        }

        case "participant_left": {
          const participant = event.participant;
          const room = event.room;
          if (participant?.identity && room?.name && isStudentParticipant(participant.metadata)) {
            const classSession = await prisma.classSession.findUnique({
              where: { roomName: room.name },
            });
            if (classSession) {
              await attendanceService.recordLeave(classSession.id, participant.identity);
            }
          }
          break;
        }

        default:
          logger.debug(`Unhandled webhook event: ${eventType}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      logger.error("Error processing LiveKit webhook", error);
      // Return 200 to acknowledge webhook delivery even on parsing quirks
      return res.status(200).json({ received: false, error: "Internal processing error" });
    }
  }
}

export const webhookController = new WebhookController();
export default webhookController;
