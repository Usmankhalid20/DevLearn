import rateLimit from 'express-rate-limit';
import { APP_CONFIG } from '../config/app-config.js';
import { ERROR_CODES } from '../common/errors/error-codes.js';

/**
 * Strict rate limiter for sensitive authentication endpoints (login, register, forgot-password)
 */
export const authLimiter = rateLimit({
  windowMs: APP_CONFIG.rateLimits.authWindowMs,
  max: APP_CONFIG.rateLimits.authMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * General rate limiter for standard API routes
 */
export const apiLimiter = rateLimit({
  windowMs: APP_CONFIG.rateLimits.apiWindowMs,
  max: APP_CONFIG.rateLimits.apiMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests from this IP. Please try again later.',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});
