import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import {
  adminUsersQuerySchema,
  updateAdminUserSchema,
  createAdministratorSchema,
  updateAdminPermissionsSchema,
  updateAdminStatusSchema,
  auditLogsQuerySchema,
  learningActivityQuerySchema,
  resourcesQuerySchema,
  updatePlatformSettingsSchema,
} from './admin.types.js';

export class AdminController {
  /**
   * GET /api/v1/admin/overview
   */
  async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getPlatformOverview();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = adminUsersQuerySchema.parse(req.query);
      const data = await adminService.getUsers(query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   */
  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getUserDetails(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = updateAdminUserSchema.parse(req.body);
      const actorId = req.user!.id;
      const targetId = req.params.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const user = await adminService.updateUser(actorId, targetId, payload, meta);
      res.status(200).json({
        success: true,
        data: { user, message: 'User updated successfully' },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/users/:id/suspend
   */
  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = req.user!.id;
      const targetId = req.params.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const user = await adminService.suspendUser(actorId, targetId, meta);
      res.status(200).json({
        success: true,
        data: { user, message: 'User suspended successfully' },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/users/:id/restore
   */
  async restoreUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = req.user!.id;
      const targetId = req.params.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const user = await adminService.restoreUser(actorId, targetId, meta);
      res.status(200).json({
        success: true,
        data: { user, message: 'User restored successfully' },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/users/:id/revoke-sessions
   */
  async revokeSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = req.user!.id;
      const targetId = req.params.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const data = await adminService.revokeUserSessions(actorId, targetId, meta);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/admin/users/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = req.user!.id;
      const targetId = req.params.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const data = await adminService.deleteUser(actorId, targetId, meta);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // SUPER ADMIN: ADMINISTRATOR MANAGEMENT
  // ==========================================

  /**
   * GET /api/v1/admin/administrators
   */
  async getAdministrators(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getAdministrators();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/administrators
   */
  async createAdministrator(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createAdministratorSchema.parse(req.body);
      const actorId = req.user!.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const administrator = await adminService.createAdministrator(actorId, input, meta);
      res.status(201).json({
        success: true,
        data: { administrator, message: 'Administrator account created successfully.' },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/administrators/:id/permissions
   */
  async updateAdminPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateAdminPermissionsSchema.parse(req.body);
      const actorId = req.user!.id;
      const targetId = req.params.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const updated = await adminService.updateAdminPermissions(actorId, targetId, input, meta);
      res.status(200).json({
        success: true,
        data: { administrator: updated, message: 'Administrator permissions updated successfully.' },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/administrators/:id/status
   */
  async updateAdminStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateAdminStatusSchema.parse(req.body);
      const actorId = req.user!.id;
      const targetId = req.params.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const updated = await adminService.updateAdminStatus(actorId, targetId, input, meta);
      res.status(200).json({
        success: true,
        data: { administrator: updated, message: 'Administrator status updated successfully.' },
      });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // LEARNING ACTIVITY & RESOURCES & SETTINGS
  // ==========================================

  /**
   * GET /api/v1/admin/activity
   */
  async getLearningActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const query = learningActivityQuerySchema.parse(req.query);
      const data = await adminService.getLearningActivities(query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/resources
   */
  async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const query = resourcesQuerySchema.parse(req.query);
      const data = await adminService.getResources(query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/settings
   */
  async getPlatformSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getPlatformSettings();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/settings
   */
  async updatePlatformSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updatePlatformSettingsSchema.parse(req.body);
      const actorId = req.user!.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const data = await adminService.updatePlatformSettings(actorId, input, meta);
      res.status(200).json({ success: true, data, message: 'Platform settings updated successfully.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/operations/purge-cache
   */
  async purgeCache(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = req.user!.id;
      const meta = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const data = await adminService.purgeCache(actorId, meta);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/telemetry
   */
  async getTelemetry(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getTelemetry();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = auditLogsQuerySchema.parse(req.query);
      const data = await adminService.getAuditLogs(query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
