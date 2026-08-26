import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { subjectsRouter } from '../modules/subjects/subjects.routes.js';
import { tasksRouter } from '../modules/tasks/tasks.routes.js';
import { learningRouter } from '../modules/learning/learning.routes.js';
import { resourcesRouter } from '../modules/resources/resources.routes.js';
import { contributionsRouter } from '../modules/contributions/contributions.routes.js';
import { analyticsRouter } from '../modules/analytics/analytics.routes.js';
import { settingsRouter } from '../modules/settings/settings.routes.js';
import { goalsRouter } from '../modules/goals/goals.routes.js';
import { exportRouter } from '../modules/export/export.routes.js';
import { coursesRouter } from '../modules/courses/courses.routes.js';
import { achievementsRouter } from '../modules/achievements/achievements.routes.js';
import { diagnosticsRouter } from '../modules/diagnostics/diagnostics.routes.js';

export const rootRouter = Router();

// Mount system health & diagnostics
rootRouter.use(healthRouter);
rootRouter.use('/system', diagnosticsRouter);

// Mount domain modules
rootRouter.use('/auth', authRouter);
rootRouter.use('/subjects', subjectsRouter);
rootRouter.use('/tasks', tasksRouter);
rootRouter.use('/courses', coursesRouter);
rootRouter.use('/learning-sessions', learningRouter);
rootRouter.use('/resources', resourcesRouter);
rootRouter.use('/contributions', contributionsRouter);
rootRouter.use('/analytics', analyticsRouter);
rootRouter.use('/achievements', achievementsRouter);
rootRouter.use('/settings', settingsRouter);
rootRouter.use('/goals', goalsRouter);
rootRouter.use('/export', exportRouter);
