import { Request, Response, NextFunction } from 'express';
import { diagnosticsService } from './diagnostics.service.js';

export class DiagnosticsController {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const diagnostics = await diagnosticsService.getDiagnostics();
      res.status(200).json({ success: true, data: diagnostics });
    } catch (err) {
      next(err);
    }
  }
}

export const diagnosticsController = new DiagnosticsController();
