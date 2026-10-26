import cron from "node-cron";
import { cleanupService } from "../services/cleanupService";
import { logger } from "../utils/logger";

export function initializeCronJobs() {
  logger.info("Initializing automated recording cleanup & lifecycle cron schedulers...");

  // 1. Run hourly at minute 0 (0 * * * *) for 7-day expiration cleanup
  cron.schedule("0 * * * *", async () => {
    try {
      logger.info("[CRON] Running hourly expired recording cleanup job...");
      const result = await cleanupService.cleanupExpiredRecordings();
      logger.info(
        `[CRON] Lifecycle completed. Processed: ${result.processed}, Archived: ${result.archived}, Deleted: ${result.deleted}, Failed: ${result.failed}`
      );
    } catch (error) {
      logger.error("[CRON] Error executing hourly recording cleanup", error);
    }
  });

  // 2. Run every 6 hours at minute 30 to check for recordings expiring soon and alert students
  cron.schedule("30 */6 * * *", async () => {
    try {
      logger.info("[CRON] Checking for recordings expiring soon (48h/24h warnings)...");
      await cleanupService.checkExpiringSoonRecordings();
    } catch (error) {
      logger.error("[CRON] Error executing expiring soon check", error);
    }
  });

  logger.info("Recording lifecycle cron jobs registered successfully.");
}
