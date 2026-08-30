import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import {
  requireRole,
  requireSuperAdmin,
  requirePermission,
} from '../../middleware/role.middleware.js';

export const adminRouter = Router();

// Apply authentication and ADMIN / SUPER_ADMIN guard across all admin endpoints
adminRouter.use(requireAuth, requireRole(['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']));

// Overview & Analytics
adminRouter.get(
  '/overview',
  requirePermission('view_platform_analytics'),
  (req, res, next) => adminController.getOverview(req, res, next)
);

// Users Directory & Moderation
adminRouter.get(
  '/users',
  requirePermission('view_users'),
  (req, res, next) => adminController.getUsers(req, res, next)
);
adminRouter.get(
  '/users/:id',
  requirePermission('view_users'),
  (req, res, next) => adminController.getUserDetails(req, res, next)
);
adminRouter.patch(
  '/users/:id',
  requirePermission('manage_users'),
  (req, res, next) => adminController.updateUser(req, res, next)
);
adminRouter.post(
  '/users/:id/suspend',
  requirePermission('suspend_users'),
  (req, res, next) => adminController.suspendUser(req, res, next)
);
adminRouter.post(
  '/users/:id/restore',
  requirePermission('restore_users'),
  (req, res, next) => adminController.restoreUser(req, res, next)
);
adminRouter.post(
  '/users/:id/revoke-sessions',
  requirePermission('manage_users'),
  (req, res, next) => adminController.revokeSessions(req, res, next)
);
adminRouter.delete(
  '/users/:id',
  requireSuperAdmin(),
  (req, res, next) => adminController.deleteUser(req, res, next)
);

// Administrator Management (Super Admin only)
adminRouter.get(
  '/administrators',
  requireSuperAdmin(),
  (req, res, next) => adminController.getAdministrators(req, res, next)
);
adminRouter.post(
  '/administrators',
  requireSuperAdmin(),
  (req, res, next) => adminController.createAdministrator(req, res, next)
);
adminRouter.patch(
  '/administrators/:id/permissions',
  requireSuperAdmin(),
  (req, res, next) => adminController.updateAdminPermissions(req, res, next)
);
adminRouter.patch(
  '/administrators/:id/status',
  requireSuperAdmin(),
  (req, res, next) => adminController.updateAdminStatus(req, res, next)
);

// Learning Activity Oversight
adminRouter.get(
  '/activity',
  requirePermission('view_learning_activity'),
  (req, res, next) => adminController.getLearningActivities(req, res, next)
);

// Resources Management
adminRouter.get(
  '/resources',
  requirePermission('view_resources'),
  (req, res, next) => adminController.getResources(req, res, next)
);

// Platform Settings & Operations
adminRouter.get(
  '/settings',
  requirePermission('view_settings'),
  (req, res, next) => adminController.getPlatformSettings(req, res, next)
);
adminRouter.patch(
  '/settings',
  requirePermission('manage_settings'),
  (req, res, next) => adminController.updatePlatformSettings(req, res, next)
);
adminRouter.post(
  '/operations/purge-cache',
  requireSuperAdmin(),
  (req, res, next) => adminController.purgeCache(req, res, next)
);

// Telemetry & Health
adminRouter.get(
  '/telemetry',
  requirePermission('view_system_health'),
  (req, res, next) => adminController.getTelemetry(req, res, next)
);

// Security Audit Logs
adminRouter.get(
  '/audit-logs',
  requirePermission('view_audit_logs'),
  (req, res, next) => adminController.getAuditLogs(req, res, next)
);
