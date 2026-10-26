import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { libraryService, LIBRARY_MAX_FILE_BYTES } from "../services/libraryService";
import { createLibraryResourceSchema, updateLibraryResourceSchema } from "../validators/misc.validator";
import { sendSuccess } from "../utils/apiResponse";
import { BadRequestError } from "../utils/errors";

export const libraryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIBRARY_MAX_FILE_BYTES, files: 1 },
}).single("file");

export class LibraryController {
  async getPublicCatalogue(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await libraryService.getPublicCatalogue());
    } catch (error) {
      next(error);
    }
  }

  async getStudentResources(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await libraryService.getStudentResources(req.user!.id));
    } catch (error) {
      next(error);
    }
  }

  async getFileUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const inline = req.query.inline === "1";
      return sendSuccess(res, await libraryService.getFileUrl(String(req.params.id), req.user!, inline));
    } catch (error) {
      next(error);
    }
  }

  async getAdminResources(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, await libraryService.getAdminResources());
    } catch (error) {
      next(error);
    }
  }

  async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError("Please attach a file.");
      const validated = createLibraryResourceSchema.parse(req.body);
      const resource = await libraryService.createResource(req.user!.id, req.file, validated, req.ip);
      return sendSuccess(res, resource, "Resource uploaded", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateLibraryResourceSchema.parse(req.body);
      return sendSuccess(res, await libraryService.updateResource(String(req.params.id), validated), "Resource updated");
    } catch (error) {
      next(error);
    }
  }

  async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      await libraryService.deleteResource(String(req.params.id), req.user!.id, req.ip);
      return sendSuccess(res, null, "Resource deleted");
    } catch (error) {
      next(error);
    }
  }
}

export const libraryController = new LibraryController();
export default libraryController;
