import { Request, Response, NextFunction } from 'express';
import { achievementsService } from './achievements.service.js';

export class AchievementsController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const badges = await achievementsService.getAchievements(req.user!.id);
      res.status(200).json({ success: true, data: badges });
    } catch (err) {
      next(err);
    }
  }
}

export const achievementsController = new AchievementsController();
