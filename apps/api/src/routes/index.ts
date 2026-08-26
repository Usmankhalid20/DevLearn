import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';

export const rootRouter = Router();

// Mount system health
rootRouter.use(healthRouter);

// Mount authentication module
rootRouter.use('/auth', authRouter);
