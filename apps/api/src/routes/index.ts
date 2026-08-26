import { Router } from 'express';
import { healthRouter } from './health.routes.js';

export const rootRouter = Router();

// Mount system health
rootRouter.use(healthRouter);

// Domain modules (Auth, Learning, Tasks, Analytics, etc.) will be mounted here in Phase 02+
