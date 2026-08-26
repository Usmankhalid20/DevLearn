import { Router } from 'express';
import { achievementsController } from './achievements.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const achievementsRouter = Router();

achievementsRouter.use(requireAuth);

achievementsRouter.get('/', (req, res, next) => achievementsController.get(req, res, next));
