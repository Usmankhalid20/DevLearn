/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

/**
 * Health Check Status contract
 */
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected' | 'unreachable';
    redis: 'connected' | 'disconnected' | 'unreachable';
  };
}

/**
 * Core User entity preview (used across API & Web)
 */
export interface UserSummaryDto {
  id: string;
  email: string;
  name?: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

/**
 * Contribution Level (Grayscale 0-4)
 */
export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDayDto {
  date: string; // YYYY-MM-DD
  minutes: number;
  level: ContributionLevel;
  sessionCount: number;
}
