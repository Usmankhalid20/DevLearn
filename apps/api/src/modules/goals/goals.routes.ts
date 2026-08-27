import { Router } from 'express';
import { goalsController } from './goals.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const goalsRouter = Router();

goalsRouter.use(requireAuth);

goalsRouter.get('/', (req, res, next) => goalsController.list(req, res, next));
goalsRouter.post('/', (req, res, next) => goalsController.create(req, res, next));
goalsRouter.put('/:id', (req, res, next) => goalsController.update(req, res, next));
goalsRouter.delete('/:id', (req, res, next) => goalsController.delete(req, res, next));
