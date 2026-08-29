import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import { sendSuccess } from '../../common/http/response.js';
import { APP_CONFIG } from '../../config/app-config.js';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await usersService.getProfile(req.user!.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await usersService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.deleteAccount(req.user!.id);

      // Clear session cookie upon deletion
      res.clearCookie(APP_CONFIG.session.cookieName, {
        httpOnly: APP_CONFIG.session.httpOnly,
        secure: APP_CONFIG.session.secure,
        sameSite: APP_CONFIG.session.sameSite,
      });

      sendSuccess(res, { deleted: true });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
