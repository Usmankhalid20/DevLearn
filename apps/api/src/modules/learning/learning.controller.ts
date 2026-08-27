import { Request, Response, NextFunction } from 'express';
import { learningService } from './learning.service.js';
import { createLearningSessionSchema, updateLearningSessionSchema } from './learning.types.js';

export class LearningController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const subjectId = req.query.subjectId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const result = await learningService.listSessions(req.user!.id, {
        subjectId,
        startDate,
        endDate,
        limit,
        offset,
      });

      res.status(200).json({ success: true, data: result.sessions, meta: { total: result.total } });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createLearningSessionSchema.parse(req.body);
      const session = await learningService.createSession(req.user!.id, validated);
      res.status(201).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateLearningSessionSchema.parse(req.body);
      const session = await learningService.updateSession(req.user!.id, req.params.id, validated);
      res.status(200).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await learningService.deleteSession(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { message: 'Session deleted successfully' } });
    } catch (err) {
      next(err);
    }
  }
}

export const learningController = new LearningController();
