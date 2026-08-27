import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      commandTimeout: 1000,
      connectTimeout: 1000,
      retryStrategy(times) {
        if (times > 2) return null;
        return Math.min(times * 100, 500);
      },
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      // Log redis connection warnings without crashing the app if cache is offline
      if (env.NODE_ENV !== 'test') {
        console.warn('⚠️ Redis connection warning:', err.message);
      }
    });
  }

  return redisClient;
}

export const redis = getRedisClient();
