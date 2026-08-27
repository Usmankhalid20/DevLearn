import process from 'process';
import { prisma } from '../../database/prisma.js';
import { getRedisClient } from '../../database/redis.js';
import type { DiagnosticsDto } from '@devlearn/types';

function withTimeout<T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Probe timed out')), timeoutMs)
    ),
  ]);
}

export class DiagnosticsService {
  async getDiagnostics(): Promise<DiagnosticsDto> {
    // 1. Check DB Latency with timeout
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    let dbLatencyMs = 0;
    try {
      const dbStart = Date.now();
      await withTimeout(prisma.$queryRaw`SELECT 1`, 2000);
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    // 2. Check Redis Latency with timeout
    let redisStatus: 'connected' | 'disconnected' = 'disconnected';
    let redisLatencyMs = 0;
    try {
      const redis = getRedisClient();
      const redisStart = Date.now();
      await withTimeout(redis.ping(), 2000);
      redisLatencyMs = Date.now() - redisStart;
      redisStatus = 'connected';
    } catch {
      redisStatus = 'disconnected';
    }

    const mem = process.memoryUsage();

    return {
      status: dbStatus === 'connected' && redisStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        rssMB: Math.round(mem.rss / 1024 / 1024),
      },
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatencyMs,
        },
      },
    };
  }
}

export const diagnosticsService = new DiagnosticsService();
