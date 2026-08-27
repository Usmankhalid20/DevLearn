import { Router } from 'express';
import { diagnosticsController } from './diagnostics.controller.js';

export const diagnosticsRouter = Router();

// Diagnostics is an open system telemetry endpoint (or protected if needed)
diagnosticsRouter.get('/diagnostics', (req, res, next) =>
  diagnosticsController.get(req, res, next)
);
