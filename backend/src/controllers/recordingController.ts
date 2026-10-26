import { Request, Response, NextFunction } from "express";
import { recordingService } from "../services/recordingService";
import { sendSuccess } from "../utils/apiResponse";

export class RecordingController {
  async getPlayback(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await recordingService.getStudentPlaybackUrl(id, req.user!);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDownload(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await recordingService.getStudentDownloadUrl(id, req.user!, req.ip);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const recordingController = new RecordingController();
export default recordingController;
