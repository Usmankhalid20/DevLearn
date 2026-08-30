'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  Activity,
  ScrollText,
  Shield,
  LogOut,
  BookOpen,
  Clock,
  Settings,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import type { AdminPermission } from '@devlearn/types';

interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: AdminPermission;
  superAdminOnly?: boolean;
}

const adminNavItems: AdminNavItem[] = [
  {
    title: 'Overview',
    href: '/admin/overview',
    icon: BarChart3,
    permission: 'view_platform_analytics',
  },
  {
    title: 'Users Directory',
    href: '/admin/users',
    icon: Users,
    permission: 'view_users',
  },
  {
    title: 'Learning Activity',
    href: '/admin/activity',
    icon: Clock,
    permission: 'view_learning_activity',
  },
  {
    title: 'Resources Catalog',
    href: '/admin/resources',
    icon: BookOpen,
    permission: 'view_resources',
  },
  {
    title: 'Admin Management',
    href: '/admin/administrators',
    icon: ShieldCheck,
    superAdminOnly: true,
  },
  {
    title: 'Permission Matrix',
    href: '/admin/permissions',
    icon: Key,
    superAdminOnly: true,
  },
  {
    title: 'System Health',
    href: '/admin/telemetry',
    icon: Activity,
    permission: 'view_system_health',
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: ScrollText,
    permission: 'view_audit_logs',
  },
  {
    title: 'Platform Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'view_settings',
  },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { can, isSuperAdmin } = usePermissions();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const isSuper = isSuperAdmin || user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r border-neutral-800 bg-[#0c0d0e] text-neutral-200 select-none shrink-0',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-800/80 px-4">
        <Link href="/admin/overview" className="flex items-center space-x-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-black text-xs shadow-sm group-hover:bg-neutral-200 transition-colors">
            DL
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white font-mono leading-none">
                DevLearn
              </span>
            </div>
            {/* <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase leading-tight mt-0.5">
              Admin Console
            </span> */}
          </div>
        </Link>

        {/* <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono font-medium border flex items-center gap-1 tracking-tight',
            isSuper
              ? 'bg-neutral-800/90 text-neutral-200 border-neutral-700'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800'
          )}
        >
          <Shield className="h-2.5 w-2.5 text-neutral-300" />
          {isSuper ? 'SUPERADMIN' : 'ADMIN'}
        </span> */}
      </div>

      {/* Navigation Items (Uniform, Professional Spacing) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-neutral-800">
        {adminNavItems.map((item) => {
          if (item.superAdminOnly && !isSuper) return null;
          if (item.permission && !can(item.permission)) return null;

          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/overview' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-neutral-800/80 text-white font-semibold border border-neutral-700/60 shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
              )}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 group-hover:text-neutral-300'
                  )}
                />
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Admin Session & Profile Footer */}
      <div className="border-t border-neutral-800/80 p-3 bg-neutral-950/40 space-y-2">
        <div className="flex items-center justify-between rounded-md bg-neutral-900/60 border border-neutral-800 px-2.5 py-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-white text-[11px] font-mono font-semibold shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-neutral-950" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate leading-tight">
                {user?.name || user?.email?.split('@')[0] || 'Administrator'}
              </p>
              <p className="text-[10px] font-mono text-neutral-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center space-x-2 rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs font-mono text-neutral-400 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Sign Out of Admin Console"
        description="Are you sure you want to end your administrative session? You will need to re-authenticate with your administrator credentials to access platform operations."
        confirmLabel="Sign Out"
        variant="danger"
        icon="logout"
        onConfirm={async () => {
          setShowLogoutModal(false);
          await logout();
        }}
      />
    </aside>
  );
}
