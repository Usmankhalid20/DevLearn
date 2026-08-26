import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service.js';

export class AnalyticsController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await analyticsService.getSummary(req.user!.id);
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
