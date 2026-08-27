import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { learningService } from './learning.service.js';
import { createLearningSessionSchema, updateLearningSessionSchema } from './learning.types.js';

const listQuerySchema = z.object({
  subjectId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export class LearningController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedQuery = listQuerySchema.parse(req.query);

      const result = await learningService.listSessions(req.user!.id, {
        subjectId: parsedQuery.subjectId,
        startDate: parsedQuery.startDate,
        endDate: parsedQuery.endDate,
        limit: parsedQuery.limit,
        offset: parsedQuery.offset,
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
