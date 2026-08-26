import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './middleware/logger.js';
import { prisma } from './database/prisma.js';
import { redis } from './database/redis.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 DevLearn API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`🌐 Web Origin CORS enabled for: ${env.WEB_ORIGIN}`);
});

// Graceful Shutdown Handler
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected.');
    } catch (err) {
      logger.error({ err }, 'Error disconnecting Prisma');
    }

    try {
      redis.disconnect();
      logger.info('Redis disconnected.');
    } catch (err) {
      logger.error({ err }, 'Error disconnecting Redis');
    }

    process.exit(0);
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
