import { Router } from 'express';
import { tasksController } from './tasks.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const tasksRouter = Router();

// All task routes require authentication
tasksRouter.use(requireAuth);

tasksRouter.get('/', (req, res, next) => tasksController.list(req, res, next));
tasksRouter.post('/', (req, res, next) => tasksController.create(req, res, next));
tasksRouter.patch('/:id/toggle', (req, res, next) => tasksController.toggle(req, res, next));
tasksRouter.patch('/:id/complete', (req, res, next) => tasksController.toggle(req, res, next));
tasksRouter.patch('/:id', (req, res, next) => tasksController.update(req, res, next));
tasksRouter.put('/:id', (req, res, next) => tasksController.update(req, res, next));
tasksRouter.delete('/:id', (req, res, next) => tasksController.delete(req, res, next));
