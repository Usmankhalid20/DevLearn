import { Response } from 'express';
import type { ApiResponse } from '@devlearn/types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, meta?: Record<string, unknown>) {
  return sendSuccess(res, data, 201, meta);
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}

export function sendError(res: Response, statusCode: number, message: string, code: string, details?: unknown) {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return res.status(statusCode).json(response);
}
