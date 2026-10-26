import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logData = {
      method,
      url: originalUrl,
      status: statusCode,
      durationMs: duration,
      ip: ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logData);
    } else {
      logger.info(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logData);
    }
  });

  next();
}
