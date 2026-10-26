import { prisma } from "./prisma";
import { logger } from "../utils/logger";

export interface LogAuditParams {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export class AuditService {
  async log(params: LogAuditParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      logger.error("Failed to write audit log to database", error);
      return null;
    }
  }

  async getRecentLogs(limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const auditService = new AuditService();
export default auditService;
