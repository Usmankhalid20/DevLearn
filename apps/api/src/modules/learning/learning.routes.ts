import { Router } from 'express';
import { learningController } from './learning.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const learningRouter = Router();

// All learning session routes require authentication
learningRouter.use(requireAuth);

learningRouter.get('/', (req, res, next) => learningController.list(req, res, next));
learningRouter.post('/', (req, res, next) => learningController.create(req, res, next));
learningRouter.put('/:id', (req, res, next) => learningController.update(req, res, next));
learningRouter.delete('/:id', (req, res, next) => learningController.delete(req, res, next));
