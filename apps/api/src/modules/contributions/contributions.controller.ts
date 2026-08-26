import { Request, Response, NextFunction } from 'express';
import { contributionsService } from './contributions.service.js';

export class ContributionsController {
  async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const calendar = await contributionsService.getCalendar(req.user!.id);
      res.status(200).json({ success: true, data: calendar });
    } catch (err) {
      next(err);
    }
  }
}

export const contributionsController = new ContributionsController();
