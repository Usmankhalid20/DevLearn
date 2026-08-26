import { Request, Response, NextFunction } from 'express';
import { exportService } from './export.service.js';

export class ExportController {
  async exportJson(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await exportService.exportJson(req.user!.id);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="devlearn-export-${new Date().toISOString().slice(0, 10)}.json"`
      );
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await exportService.exportCsv(req.user!.id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="devlearn-sessions-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}

export const exportController = new ExportController();
