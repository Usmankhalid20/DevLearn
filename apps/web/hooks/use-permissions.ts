'use client';

import { useAuth } from '@/providers/auth-provider';
import type { AdminPermission } from '@devlearn/types';

export function usePermissions() {
  const { user } = useAuth();

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';

  const userPermissions = (user?.permissions || []) as AdminPermission[];

  const can = (permission: AdminPermission): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: AdminPermission[]): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return permissions.some((p) => userPermissions.includes(p));
  };

  const hasAllPermissions = (permissions: AdminPermission[]): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    return permissions.every((p) => userPermissions.includes(p));
  };

  return {
    can,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    permissions: userPermissions,
  };
}
