import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

// @ts-expect-error Prisma event types
prisma.$on("error", (e: unknown) => {
  logger.error("Prisma Database Error", e);
});

// @ts-expect-error Prisma event types
prisma.$on("warn", (e: unknown) => {
  logger.warn("Prisma Database Warning", e);
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
