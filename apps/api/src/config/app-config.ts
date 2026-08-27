import { env } from './env.js';

export const APP_CONFIG = {
  name: 'DevLearn API',
  version: '0.1.0',
  session: {
    cookieName: 'devlearn_session',
    maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
  },
  rateLimits: {
    authWindowMs: 15 * 60 * 1000, // 15 minutes
    authMaxAttempts: 15,
    apiWindowMs: 15 * 60 * 1000, // 15 minutes
    apiMaxRequests: 300,
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
} as const;
