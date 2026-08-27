import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../common/logging/logger.js';
import { AppError } from '../common/errors/app-error.js';
import { ERROR_CODES } from '../common/errors/error-codes.js';
import { sendError } from '../common/http/response.js';

export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  return sendError(
    res,
    404,
    `Route ${req.method} ${req.originalUrl} not found`,
    ERROR_CODES.NOT_FOUND
  );
}

// Centralized error handler
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return sendError(
      res,
      400,
      'Invalid request data',
      ERROR_CODES.VALIDATION_ERROR,
      err.flatten().fieldErrors
    );
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.code, err.details);
  }

  logger.error({ err, path: req.path, method: req.method, requestId: req.id }, 'Unhandled Exception');

  // Generic 500 without leaking internal stack traces in production
  return sendError(
    res,
    500,
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
}
