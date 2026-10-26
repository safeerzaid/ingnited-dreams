import { z } from "zod";

export const updateSettingsSchema = z.object({
  recordingRetentionDays: z.number().int().min(1).max(365).optional(),
  academyName: z.string().min(2).max(100).optional(),
  academyTimezone: z.string().min(2).max(50).optional(),
  classJoinWindowMinutes: z.number().int().min(0).max(120).optional(),
  defaultRecordingEnabled: z.boolean().optional(),
  downloadEnabled: z.boolean().optional(),
});
