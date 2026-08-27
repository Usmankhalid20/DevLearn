import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service.js';
import { updateSettingsSchema } from './settings.types.js';

export class SettingsController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings(req.user!.id);
      res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateSettingsSchema.parse(req.body);
      const settings = await settingsService.updateSettings(req.user!.id, validated);
      res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }
}

export const settingsController = new SettingsController();
