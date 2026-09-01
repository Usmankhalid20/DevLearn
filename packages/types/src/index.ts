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

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPERADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED' | 'SUSPENDED' | 'BANNED';

export type AdminPermission =
  | 'view_users'
  | 'manage_users'
  | 'suspend_users'
  | 'restore_users'
  | 'view_learning_activity'
  | 'view_resources'
  | 'manage_resources'
  | 'moderate_resources'
  | 'view_platform_analytics'
  | 'view_admins'
  | 'create_admins'
  | 'update_admin_permissions'
  | 'disable_admins'
  | 'view_settings'
  | 'manage_settings'
  | 'view_audit_logs'
  | 'view_system_health';

/**
 * Core User entity DTO
 */
export interface UserDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  permissions?: AdminPermission[];
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  settings?: UserSettingsDto | null;
}

export interface UserSettingsDto {
  timezone: string;
  dailyGoalMinutes: number;
  theme: string;
}

export interface StreakSummaryDto {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string | null;
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

/**
 * Admin Module DTOs
 */
export interface AdminOverviewMetricsDto {
  totalUsers: number;
  activeUsersLast30Days: number;
  totalLearningHours: number;
  totalSessionsLogged: number;
  activeStreaksCount: number;
  totalTasksCompleted: number;
}

export interface AdminGrowthPointDto {
  date: string;
  count?: number;
  totalMinutes?: number;
}

export interface AdminPopularSubjectDto {
  name: string;
  totalMinutes: number;
  userCount: number;
}

export interface AdminOverviewDto {
  metrics: AdminOverviewMetricsDto;
  growth: {
    userSignupsPast30Days: AdminGrowthPointDto[];
    studyMinutesPast30Days: AdminGrowthPointDto[];
  };
  popularSubjects: AdminPopularSubjectDto[];
}

export interface AdminUserListItemDto extends UserDto {
  _count: {
    learningSessions: number;
    subjects: number;
    tasks: number;
  };
}

export interface AdminUsersListResponseDto {
  users: AdminUserListItemDto[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface AdminTelemetryDto {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  uptimeSeconds: number;
  system: {
    nodeVersion: string;
    platform: string;
    memoryUsageMb: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
    };
  };
  database: {
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    latencyMs: number;
    openConnections?: number;
  };
  redis: {
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    latencyMs: number;
    usedMemoryKb?: number;
  };
}

export interface AuditLogItemDto {
  id: string;
  action: string;
  actor: {
    id: string;
    name: string | null;
    email: string;
  };
  target?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminAuditLogsResponseDto {
  logs: AuditLogItemDto[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface AdministratorDto extends UserDto {
  permissions: AdminPermission[];
  lastActivityAt?: string | null;
}

export interface AdministratorsListResponseDto {
  administrators: AdministratorDto[];
}

export interface CreateAdministratorInputDto {
  email: string;
  name: string;
  password?: string;
  permissions: AdminPermission[];
}

export interface UpdateAdministratorPermissionsInputDto {
  permissions: AdminPermission[];
}

export interface UpdateAdministratorStatusInputDto {
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
}

export interface AdminLearningActivityItemDto {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  subjectName: string;
  durationMinutes: number;
  date: string;
  createdAt: string;
}

export interface AdminLearningActivityResponseDto {
  activities: AdminLearningActivityItemDto[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface AdminResourceItemDto {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  url: string;
  type: string;
  subjectName?: string | null;
  createdAt: string;
}

export interface AdminResourcesResponseDto {
  resources: AdminResourceItemDto[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface PlatformSettingsDto {
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  defaultDailyGoalMinutes: number;
  systemNotification?: string | null;
}


