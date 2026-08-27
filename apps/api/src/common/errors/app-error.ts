import { ERROR_CODES, type ErrorCode } from './error-codes.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: ErrorCode | string = ERROR_CODES.INTERNAL_SERVER_ERROR,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code: ErrorCode = ERROR_CODES.NOT_FOUND) {
    super(404, message, code);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code: ErrorCode = ERROR_CODES.UNAUTHORIZED) {
    super(401, message, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', code: ErrorCode = ERROR_CODES.FORBIDDEN) {
    super(403, message, code);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(400, message, ERROR_CODES.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code: ErrorCode = ERROR_CODES.CONFLICT) {
    super(409, message, code);
    this.name = 'ConflictError';
  }
}
