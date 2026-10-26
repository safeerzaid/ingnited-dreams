import { z } from "zod";

export const extendRecordingExpirySchema = z.object({
  additionalDays: z.number().int().min(1).max(30).default(7),
  reason: z.string().min(3).max(500).optional(),
});

export const manualRecordingDeleteSchema = z.object({
  confirmation: z.literal("CONFIRM_DELETE"),
  reason: z.string().min(3).max(500),
});
