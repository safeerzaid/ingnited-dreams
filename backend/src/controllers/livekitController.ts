import { Request, Response, NextFunction } from "express";
import { classService } from "../services/classService";
import { sendSuccess } from "../utils/apiResponse";

export class LivekitController {
  async getToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId } = req.body;
      if (!classId) {
        return res.status(400).json({ success: false, message: "classId is required" });
      }

      const tokenData = await classService.getJoinToken(classId, {
        id: req.user!.id,
        name: req.user!.name,
        role: req.user!.role,
      });

      return sendSuccess(res, tokenData);
    } catch (error) {
      next(error);
    }
  }

  async startClass(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await classService.startClass(id, req.user!.id, req.user!.role);
      return sendSuccess(res, result, "Live session started");
    } catch (error) {
      next(error);
    }
  }

  async endClass(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await classService.endClass(id, req.user!.id, req.user!.role);
      return sendSuccess(res, result, "Live session ended");
    } catch (error) {
      next(error);
    }
  }
}

export const livekitController = new LivekitController();
export default livekitController;
