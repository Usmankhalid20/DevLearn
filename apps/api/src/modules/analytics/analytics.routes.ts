import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get('/summary', (req, res, next) =>
  analyticsController.getSummary(req, res, next)
);
