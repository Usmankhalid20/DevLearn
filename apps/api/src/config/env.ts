import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url().default('postgresql://devlearn:devlearn_dev_password@127.0.0.1:5433/devlearn_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  WEB_ORIGIN: z.string().default('http://localhost:3000,http://localhost:8081'),
  SESSION_SECRET: z.string().min(16).default('devlearn_default_session_secret_change_in_production'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('DevLearn <noreply@devlearn.io>'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
