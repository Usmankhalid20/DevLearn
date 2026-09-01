import { z } from 'zod';
import type { AdminPermission } from '@devlearn/types';

export const ADMIN_PERMISSIONS_LIST: AdminPermission[] = [
  'view_users',
  'manage_users',
  'suspend_users',
  'restore_users',
  'view_learning_activity',
  'view_resources',
  'manage_resources',
  'moderate_resources',
  'view_platform_analytics',
  'view_admins',
  'create_admins',
  'update_admin_permissions',
  'disable_admins',
  'view_settings',
  'manage_settings',
  'view_audit_logs',
  'view_system_health',
];

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED', 'SUSPENDED', 'BANNED']).optional(),
});

export type AdminUsersQueryInput = z.infer<typeof adminUsersQuerySchema>;

export const updateAdminUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED', 'SUSPENDED', 'BANNED']).optional(),
  permissions: z.array(z.string()).optional(),
  isEmailVerified: z.boolean().optional(),
});

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;

export const createAdministratorSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  permissions: z.array(z.string()).default([]),
});

export type CreateAdministratorInput = z.infer<typeof createAdministratorSchema>;

export const updateAdminPermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export type UpdateAdminPermissionsInput = z.infer<typeof updateAdminPermissionsSchema>;

export const updateAdminStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'DISABLED', 'SUSPENDED']),
});

export type UpdateAdminStatusInput = z.infer<typeof updateAdminStatusSchema>;

export const auditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  action: z.string().optional(),
  actorId: z.string().uuid().optional(),
  targetId: z.string().uuid().optional(),
});

export type AuditLogsQueryInput = z.infer<typeof auditLogsQuerySchema>;

export const learningActivityQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
});

export type LearningActivityQueryInput = z.infer<typeof learningActivityQuerySchema>;

export const resourcesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
});

export type ResourcesQueryInput = z.infer<typeof resourcesQuerySchema>;

export const updatePlatformSettingsSchema = z.object({
  allowNewRegistrations: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  defaultDailyGoalMinutes: z.number().int().positive().optional(),
  systemNotification: z.string().nullable().optional(),
});

export type UpdatePlatformSettingsInput = z.infer<typeof updatePlatformSettingsSchema>;
