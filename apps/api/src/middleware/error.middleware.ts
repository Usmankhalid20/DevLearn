import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
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
    const fieldErrors = err.flatten().fieldErrors;
    const firstErrorMessage = Object.values(fieldErrors).flat()[0] || 'Invalid request data';
    return sendError(
      res,
      400,
      firstErrorMessage,
      ERROR_CODES.VALIDATION_ERROR,
      fieldErrors
    );
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.code, err.details);
  }

  logger.error({ err, path: req.path, method: req.method, requestId: req.id }, 'Unhandled Exception');

  // Handle known Prisma errors cleanly
  if ((err as any)?.code === 'P2002') {
    return sendError(
      res,
      409,
      'A record with this identifier already exists.',
      ERROR_CODES.CONFLICT
    );
  }

  if ((err as any)?.code === 'P2025') {
    return sendError(
      res,
      404,
      'The requested resource could not be found.',
      ERROR_CODES.NOT_FOUND
    );
  }

  // Safe, user-friendly 500 error response without leaking internal database or stack traces
  return sendError(
    res,
    500,
    'An unexpected server error occurred. Please try again later.',
    ERROR_CODES.INTERNAL_SERVER_ERROR
  );
}
