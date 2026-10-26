import { z } from "zod";

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export const updateInquirySchema = z.object({
  status: z.enum(["NEW", "RESOLVED"]),
});

export const createLibraryResourceSchema = z.object({
  title: z.string().trim().min(3).max(200),
  subtitle: z.string().trim().max(250).optional(),
  category: z.string().trim().min(2).max(60),
  author: z.string().trim().max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  courseId: z.string().trim().optional(),
});

export const updateLibraryResourceSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  subtitle: z.string().trim().max(250).optional(),
  category: z.string().trim().min(2).max(60).optional(),
  author: z.string().trim().max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  published: z.boolean().optional(),
});

export const createInstructorSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(20).optional().or(z.literal("")).transform((v) => v || undefined),
  specialization: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(1000).optional(),
});
