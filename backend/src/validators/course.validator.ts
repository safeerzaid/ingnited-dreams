import { z } from "zod";
import { CourseStatus } from "../types/enums";

const syllabusModuleSchema = z.object({
  name: z.string().min(2).max(200),
  hours: z.string().max(40).optional(),
  topics: z.string().max(2000).optional(),
});

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  code: z.string().min(2).max(20).toUpperCase(),
  description: z.string().min(10),
  thumbnail: z.string().url().optional().or(z.literal("")),
  status: z.nativeEnum(CourseStatus).optional().default(CourseStatus.DRAFT),
  durationHours: z.number().int().positive().default(40),
  price: z.number().int().min(0).max(10_000_000).default(0),
  marketPrice: z.number().int().min(0).max(10_000_000).optional().nullable(),
  category: optionalText(80),
  level: optionalText(80),
  durationLabel: optionalText(120),
  facultyName: optionalText(120),
  facultyTitle: optionalText(160),
  facultyBio: optionalText(300),
  // Accepts an array of modules from the admin UI and stores it as JSON text
  syllabus: z
    .array(syllabusModuleSchema)
    .max(40)
    .optional()
    .transform((modules) => (modules ? JSON.stringify(modules) : undefined)),
});

export const updateCourseSchema = createCourseSchema.partial();
