import { prisma } from "./prisma";
import { NotificationType } from "../types/enums";
import { logger } from "../utils/logger";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  idempotencyKey?: string; // Optional unique check
}

export class NotificationService {
  /**
   * Creates an in-app notification with idempotency check
   */
  async notify(params: CreateNotificationParams) {
    try {
      if (params.idempotencyKey) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24h
            },
          },
        });
        if (existing) {
          logger.debug(`Notification skipped due to idempotency for user: ${params.userId}, title: ${params.title}`);
          return existing;
        }
      }

      const notif = await prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          link: params.link,
        },
      });

      return notif;
    } catch (error) {
      logger.error("Failed to create in-app notification", error);
      return null;
    }
  }

  /**
   * Broadcasts notification to all students in a batch
   */
  async notifyBatchStudents(
    batchId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { batchId, status: "ACTIVE" },
        select: { studentId: true },
      });

      const promises = enrollments.map((e) =>
        this.notify({
          userId: e.studentId,
          type,
          title,
          message,
          link,
          idempotencyKey: `${batchId}-${type}-${title}`,
        })
      );

      await Promise.all(promises);
    } catch (error) {
      logger.error(`Failed to notify batch students for batch ${batchId}`, error);
    }
  }

  /**
   * Gets user notifications
   */
  async getUserNotifications(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Marks a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  /**
   * Marks all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
