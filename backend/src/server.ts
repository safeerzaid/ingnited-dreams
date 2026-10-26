import app from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";
import { initializeCronJobs } from "./jobs/recordingCleanupCron";
import { prisma } from "./services/prisma";

const server = app.listen(config.port, () => {
  logger.info(`🛫 IgnitedDreams Backend Server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Centralized Recording Retention: ${config.academy.recordingRetentionDays} days`);

  // Start cron jobs for 7-day automatic recording expiration & cleanup
  initializeCronJobs();
});

// Graceful Shutdown
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await prisma.$disconnect();
      logger.info("Database connection closed.");
      process.exit(0);
    } catch (e) {
      logger.error("Error during database disconnection", e);
      process.exit(1);
    }
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    logger.error("Forceful shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
