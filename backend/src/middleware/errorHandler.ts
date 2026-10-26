import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import { config } from "../config";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: formattedErrors,
    });
  }

  // Upload errors (e.g. file too large)
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message === "File too large" ? "File is too large (maximum 50 MB)." : err.message,
    });
  }

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Handle unexpected server error
  logger.error("Unhandled Exception Caught in Error Middleware", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: config.isProduction ? "An unexpected internal server error occurred" : err.message,
    details: config.isProduction ? undefined : err.stack,
  });
}
