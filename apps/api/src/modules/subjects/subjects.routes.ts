import { Router } from 'express';
import { subjectsController } from './subjects.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const subjectsRouter = Router();

// All subject routes require authentication
subjectsRouter.use(requireAuth);

subjectsRouter.get('/', (req, res, next) => subjectsController.list(req, res, next));
subjectsRouter.post('/', (req, res, next) => subjectsController.create(req, res, next));
subjectsRouter.get('/:id', (req, res, next) => subjectsController.get(req, res, next));
subjectsRouter.put('/:id', (req, res, next) => subjectsController.update(req, res, next));
subjectsRouter.delete('/:id', (req, res, next) => subjectsController.delete(req, res, next));
