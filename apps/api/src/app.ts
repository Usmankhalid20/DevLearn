import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { httpLogger } from './common/logging/logger.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Route Handlers & Domain Modules
import { healthRouter } from './health/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { subjectsRouter } from './modules/subjects/subjects.routes.js';
import { tasksRouter } from './modules/tasks/tasks.routes.js';
import { learningRouter } from './modules/learning/learning.routes.js';
import { resourcesRouter } from './modules/resources/resources.routes.js';
import { contributionsRouter } from './modules/contributions/contributions.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { settingsRouter } from './modules/settings/settings.routes.js';
import { goalsRouter } from './modules/goals/goals.routes.js';
import { exportRouter } from './modules/export/export.routes.js';
import { coursesRouter } from './modules/courses/courses.routes.js';
import { achievementsRouter } from './modules/achievements/achievements.routes.js';
import { diagnosticsRouter } from './modules/diagnostics/diagnostics.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';

export function createApp() {
  const app = express();

  // Trust proxy for secure cookies behind reverse proxies (Render, Vercel, Nginx, AWS, Cloudflare)
  app.set('trust proxy', 1);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // Request Tracking & Parsing
  app.use(requestIdMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.SESSION_SECRET));

  // Request Logging
  app.use(httpLogger);

  // API Router composition
  const apiRouter = Router();

  // Health & System
  apiRouter.use(healthRouter);
  apiRouter.use('/system', diagnosticsRouter);

  // Feature Modules
  apiRouter.use('/auth', authRouter);
  apiRouter.use('/users', usersRouter);
  apiRouter.use('/subjects', subjectsRouter);
  apiRouter.use('/tasks', tasksRouter);
  apiRouter.use('/courses', coursesRouter);
  apiRouter.use('/learning-sessions', learningRouter);
  apiRouter.use('/learning/sessions', learningRouter);
  apiRouter.use('/resources', resourcesRouter);
  apiRouter.use('/contributions', contributionsRouter);
  apiRouter.use('/analytics', analyticsRouter);
  apiRouter.use('/achievements', achievementsRouter);
  apiRouter.use('/settings', settingsRouter);
  apiRouter.use('/goals', goalsRouter);
  apiRouter.use('/export', exportRouter);
  apiRouter.use('/admin', adminRouter);

  // Mount API router under /api/v1 (primary versioned), /api (compatibility), and root
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
