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

export interface DiagnosticsDto {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  memoryUsage: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  services: {
    database: {
      status: 'connected' | 'disconnected';
      latencyMs: number;
    };
    redis: {
      status: 'connected' | 'disconnected';
      latencyMs: number;
    };
  };
}

/**
 * Core User entity DTO
 */
export interface UserDto {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsDto {
  timezone: string;
  dailyGoalMinutes: number;
  theme: string;
}

export interface AuthSessionDto {
  user: UserDto;
  settings?: UserSettingsDto | null;
}

/**
 * Subject DTO
 */
export interface SubjectDto {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  colorToken?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    learningSessions: number;
    tasks: number;
    courses?: number;
  };
}

/**
 * Task DTO
 */
export interface TaskDto {
  id: string;
  userId: string;
  subjectId?: string | null;
  subject?: SubjectDto | null;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course Track DTO
 */
export interface CourseDto {
  id: string;
  userId: string;
  subjectId?: string | null;
  subject?: SubjectDto | null;
  title: string;
  platform: string;
  url?: string | null;
  description?: string | null;
  totalDurationMinutes: number;
  completedDurationMinutes: number;
  progressPercentage: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resource DTO
 */
export interface ResourceDto {
  id: string;
  userId: string;
  title: string;
  url: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Learning Session DTO
 */
export interface LearningSessionDto {
  id: string;
  userId: string;
  subjectId: string;
  subject: SubjectDto;
  taskId?: string | null;
  task?: { id: string; title: string } | null;
  courseId?: string | null;
  course?: { id: string; title: string; platform: string } | null;
  resourceId?: string | null;
  resource?: ResourceDto | null;
  durationMinutes: number;
  date: string;
  topic?: string | null;
  learnedNotes?: string | null;
  generalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Goal DTO
 */
export interface GoalDto {
  id: string;
  userId: string;
  subjectId?: string | null;
  subject?: SubjectDto | null;
  title: string;
  description?: string | null;
  targetHours: number;
  currentHours: number;
  progressPercentage: number;
  startDate?: string | null;
  endDate?: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

/**
 * Achievement DTO
 */
export interface AchievementDto {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'time' | 'streak' | 'session' | 'breadth';
  isUnlocked: boolean;
  progressPercentage: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  unlockedAt?: string | null;
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

export interface ContributionCalendarDto {
  days: ContributionDayDto[];
  totalActiveDays: number;
  totalMinutesYear: number;
}

/**
 * Analytics Summary DTO
 */
export interface SubjectDistributionDto {
  subjectId: string;
  subjectName: string;
  totalMinutes: number;
  percentage: number;
}

export interface DailyActivityTrendDto {
  date: string;
  minutes: number;
  sessionCount: number;
}

export interface AnalyticsSummaryDto {
  totalMinutes: number;
  totalHours: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionMinutes: number;
  subjectDistribution: SubjectDistributionDto[];
  dailyActivityTrend: DailyActivityTrendDto[];
}
