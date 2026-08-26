import { Router } from 'express';
import { exportController } from './export.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const exportRouter = Router();

exportRouter.use(requireAuth);

exportRouter.get('/json', (req, res, next) => exportController.exportJson(req, res, next));
exportRouter.get('/csv', (req, res, next) => exportController.exportCsv(req, res, next));
