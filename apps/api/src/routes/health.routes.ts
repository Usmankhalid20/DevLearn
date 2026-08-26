import { Router, Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { redis } from '../database/redis.js';
import { env } from '../config/env.js';
import type { HealthStatus } from '@devlearn/types';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  let dbStatus: 'connected' | 'disconnected' | 'unreachable' = 'disconnected';
  let redisStatus: 'connected' | 'disconnected' | 'unreachable' = 'disconnected';

  // Check PostgreSQL / Prisma
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'unreachable';
  }

  // Check Redis
  try {
    const pingRes = await redis.ping();
    if (pingRes === 'PONG') {
      redisStatus = 'connected';
    }
  } catch (error) {
    redisStatus = 'unreachable';
  }

  const isHealthy = dbStatus === 'connected';
  const overallStatus = isHealthy ? (redisStatus === 'connected' ? 'ok' : 'degraded') : 'error';

  const healthPayload: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '0.1.0',
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  };

  const statusCode = overallStatus === 'error' ? 503 : 200;
  res.status(statusCode).json({
    success: overallStatus !== 'error',
    data: healthPayload,
  });
});
