import { Request, Response, NextFunction } from 'express';
import { goalsService } from './goals.service.js';
import { createGoalSchema, updateGoalSchema } from './goals.types.js';

export class GoalsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const goals = await goalsService.listGoals(req.user!.id);
      res.status(200).json({ success: true, data: goals });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createGoalSchema.parse(req.body);
      const goal = await goalsService.createGoal(req.user!.id, validated);
      res.status(201).json({ success: true, data: goal });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateGoalSchema.parse(req.body);
      const goal = await goalsService.updateGoal(req.user!.id, req.params.id, validated);
      res.status(200).json({ success: true, data: goal });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await goalsService.deleteGoal(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { message: 'Goal deleted successfully' } });
    } catch (err) {
      next(err);
    }
  }
}

export const goalsController = new GoalsController();
