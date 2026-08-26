import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        // Linear backoff up to 2 seconds
        return Math.min(times * 100, 2000);
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
