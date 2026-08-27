import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { env } from '../../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'HH:MM:ss Z',
          },
        }
      : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/api/health' || req.url === '/favicon.ico',
  },
  customProps: (req) => ({
    requestId: (req as any).id,
  }),
});
