import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service.js';
import { UnauthorizedError, AppError } from '../common/errors/app-error.js';
import { ERROR_CODES } from '../common/errors/error-codes.js';
import { APP_CONFIG } from '../config/app-config.js';
import type { UserDto, UserSettingsDto } from '@devlearn/types';

export const SESSION_COOKIE_NAME = APP_CONFIG.session.cookieName;

// Extend Express Request interface with authenticated user & settings
declare global {
  namespace Express {
    interface Request {
      user?: UserDto;
      userSettings?: UserSettingsDto | null;
      sessionId?: string;
      sessionToken?: string;
      id?: string;
    }
  }
}

/**
 * Extracts session token from Cookie or Bearer header
 */
export function extractSessionToken(req: Request): string | null {
  // Check signed cookies first, then standard cookies
  if (req.signedCookies && req.signedCookies[SESSION_COOKIE_NAME]) {
    return req.signedCookies[SESSION_COOKIE_NAME];
  }
  if (req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    return req.cookies[SESSION_COOKIE_NAME];
  }

  // Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Middleware: Requires a valid authenticated session
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractSessionToken(req);

  if (!token) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  const sessionData = await authService.validateSession(token);
  if (!sessionData) {
    next(new AppError(401, 'Invalid or expired session. Please log in again.', ERROR_CODES.SESSION_EXPIRED));
    return;
  }

  if (sessionData.user.status && sessionData.user.status !== 'ACTIVE') {
    next(new AppError(403, 'Your account has been suspended or deactivated.', ERROR_CODES.FORBIDDEN));
    return;
  }

  req.user = sessionData.user;
  req.userSettings = sessionData.settings;
  req.sessionId = sessionData.sessionId;
  req.sessionToken = token;

  next();
}
