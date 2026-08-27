import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get('/', (req, res, next) => settingsController.get(req, res, next));
settingsRouter.put('/', (req, res, next) => settingsController.update(req, res, next));
