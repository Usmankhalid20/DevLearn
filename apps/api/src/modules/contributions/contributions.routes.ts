import { Router } from 'express';
import { contributionsController } from './contributions.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const contributionsRouter = Router();

contributionsRouter.use(requireAuth);

contributionsRouter.get('/calendar', (req, res, next) =>
  contributionsController.getCalendar(req, res, next)
);
