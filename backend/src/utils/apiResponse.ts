import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: PaginationMeta
) {
  return res.status(statusCode).json({
    success: true,
    message: message || "Operation successful",
    data,
    meta,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}
