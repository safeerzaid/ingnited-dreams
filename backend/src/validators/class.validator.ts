import { z } from "zod";
import { ClassStatus } from "../types/enums";

export const createClassSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  courseId: z.string().min(1),
  batchId: z.string().min(1),
  instructorId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().optional().default("Asia/Kolkata"),
  recordingEnabled: z.boolean().optional().default(true),
});

export const updateClassSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.nativeEnum(ClassStatus).optional(),
  recordingEnabled: z.boolean().optional(),
});
