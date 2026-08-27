import { Request, Response } from 'express';
import { prisma } from '../database/prisma.js';
import { redis } from '../database/redis.js';
import { env } from '../config/env.js';
import { APP_CONFIG } from '../config/app-config.js';
import { sendSuccess } from '../common/http/response.js';
import type { HealthStatus } from '@devlearn/types';

export const healthController = {
  async getHealth(_req: Request, res: Response) {
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
      version: APP_CONFIG.version,
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };

    const statusCode = overallStatus === 'error' ? 503 : 200;
    return sendSuccess(res, healthPayload, statusCode);
  },
};
