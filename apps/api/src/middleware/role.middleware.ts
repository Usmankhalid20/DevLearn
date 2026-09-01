import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors/app-error.js';
import type { UserRole, AdminPermission } from '@devlearn/types';

/**
 * Normalizes user role check for SUPER_ADMIN vs SUPERADMIN
 */
export function isSuperAdminRole(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'SUPERADMIN';
}

/**
 * Middleware: Requires the authenticated user to possess one of the specified roles
 */
export function requireRole(allowedRoles: (UserRole | string)[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const userRole = req.user.role || 'USER';

    // If SUPER_ADMIN allowed, match either SUPER_ADMIN or SUPERADMIN
    const allowsSuperAdmin = allowedRoles.includes('SUPER_ADMIN') || allowedRoles.includes('SUPERADMIN');
    if (allowsSuperAdmin && isSuperAdminRole(userRole)) {
      next();
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      next(new ForbiddenError('Access forbidden: administrative privileges required'));
      return;
    }

    next();
  };
}

/**
 * Middleware: Strictly requires Super Administrator role
 */
export function requireSuperAdmin() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!isSuperAdminRole(req.user.role)) {
      next(new ForbiddenError('Access forbidden: Super Administrator privileges required'));
      return;
    }

    next();
  };
}

/**
 * Middleware: Requires specific granular AdminPermission OR Super Administrator role
 */
export function requirePermission(permission: AdminPermission) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    // Super Admin has full unrestricted bypass across all permissions
    if (isSuperAdminRole(req.user.role)) {
      next();
      return;
    }

    // Check if normal Admin holds explicitly assigned permission
    if (req.user.role === 'ADMIN') {
      const userPermissions = (req.user as any).permissions || [];
      if (Array.isArray(userPermissions) && userPermissions.includes(permission)) {
        next();
        return;
      }
    }

    next(new ForbiddenError(`Access forbidden: missing required permission [${permission}]`));
  };
}

export const adminOnlyMiddleware = requireRole(['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']);
