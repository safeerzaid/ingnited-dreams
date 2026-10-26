import { Request, Response, NextFunction } from "express";
import { courseService } from "../services/courseService";
import { settingService } from "../services/settingService";
import { inquiryService } from "../services/inquiryService";
import { contactInquirySchema } from "../validators/misc.validator";
import { sendSuccess } from "../utils/apiResponse";

export class PublicController {
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await courseService.getPublishedCourses();
      return sendSuccess(res, courses);
    } catch (error) {
      next(error);
    }
  }

  async getCourseBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug);
      const course = await courseService.getCourseBySlug(slug);
      return sendSuccess(res, course);
    } catch (error) {
      next(error);
    }
  }

  async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = contactInquirySchema.parse(req.body);
      const result = await inquiryService.create(validated, req.ip);
      return sendSuccess(res, result, "Thank you! Our admissions team will contact you shortly.", 201);
    } catch (error) {
      next(error);
    }
  }

  async getInauguration(req: Request, res: Response, next: NextFunction) {
    try {
      const inauguratedAt = await settingService.getInauguration();
      return sendSuccess(res, { inaugurated: Boolean(inauguratedAt), inauguratedAt });
    } catch (error) {
      next(error);
    }
  }

  async inaugurate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingService.inaugurate();
      return sendSuccess(res, result, "Website inaugurated");
    } catch (error) {
      next(error);
    }
  }

  async getInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingService.getAllSettings();
      return sendSuccess(res, {
        academyName: settings.academyName || "IgnitedDreams Skill Academy",
        timezone: settings.academyTimezone || "Asia/Kolkata",
        recordingRetentionDays: settings.recordingRetentionDays || "7",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const publicController = new PublicController();
export default publicController;
