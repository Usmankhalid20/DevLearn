import { Router } from 'express';
import { diagnosticsController } from './diagnostics.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const diagnosticsRouter = Router();

// Protected diagnostics route requiring authenticated session
diagnosticsRouter.get('/diagnostics', requireAuth, (req, res, next) =>
  diagnosticsController.get(req, res, next)
);
