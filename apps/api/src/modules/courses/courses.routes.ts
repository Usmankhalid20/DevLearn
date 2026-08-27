import { Router } from 'express';
import { coursesController } from './courses.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const coursesRouter = Router();

coursesRouter.use(requireAuth);

coursesRouter.get('/', (req, res, next) => coursesController.list(req, res, next));
coursesRouter.post('/', (req, res, next) => coursesController.create(req, res, next));
coursesRouter.put('/:id', (req, res, next) => coursesController.update(req, res, next));
coursesRouter.delete('/:id', (req, res, next) => coursesController.delete(req, res, next));
