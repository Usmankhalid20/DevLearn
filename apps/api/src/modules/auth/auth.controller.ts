import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.types.js';
import { SESSION_COOKIE_NAME, extractSessionToken } from '../../middleware/auth.middleware.js';
import { APP_CONFIG } from '../../config/app-config.js';

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: APP_CONFIG.session.httpOnly,
    secure: APP_CONFIG.session.secure,
    sameSite: APP_CONFIG.session.sameSite,
    maxAge: APP_CONFIG.session.maxAgeMs,
    signed: true,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: APP_CONFIG.session.httpOnly,
    secure: APP_CONFIG.session.secure,
    sameSite: APP_CONFIG.session.sameSite,
    path: '/',
  });
}

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      };

      const result = await authService.register(validated, meta);
      setSessionCookie(res, result.sessionToken);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          settings: result.settings,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      };

      const result = await authService.login(validated, meta);
      setSessionCookie(res, result.sessionToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          settings: result.settings,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = extractSessionToken(req);
      if (token) {
        await authService.logout(token);
      }
      clearSessionCookie(res);

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        settings: req.userSettings,
      },
    });
  }

  /**
   * POST /api/auth/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = verifyEmailSchema.parse(req.body);
      const updatedUser = await authService.verifyEmail(validated.token);

      res.status(200).json({
        success: true,
        data: {
          user: updatedUser,
          message: 'Email verified successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await authService.requestPasswordReset(validated.email);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(validated.token, validated.password);
      clearSessionCookie(res);

      res.status(200).json({
        success: true,
        data: { message: 'Password has been reset successfully. Please log in with your new password.' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
