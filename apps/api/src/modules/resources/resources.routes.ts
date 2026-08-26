import { Router } from 'express';
import { resourcesController } from './resources.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const resourcesRouter = Router();

resourcesRouter.use(requireAuth);

resourcesRouter.get('/', (req, res, next) => resourcesController.list(req, res, next));
resourcesRouter.post('/', (req, res, next) => resourcesController.create(req, res, next));
resourcesRouter.put('/:id', (req, res, next) => resourcesController.update(req, res, next));
resourcesRouter.delete('/:id', (req, res, next) => resourcesController.delete(req, res, next));
