'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Bookmark,
  History,
  BarChart3,
  Target,
  GraduationCap,
  Award,
  Settings,
  Flame,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Learning', href: '/learning', icon: BookOpen },
  { title: 'Goals', href: '/goals', icon: Target },
  { title: 'Courses', href: '/courses', icon: GraduationCap },
  { title: 'Tasks', href: '/tasks', icon: CheckSquare },
  { title: 'Achievements', href: '/achievements', icon: Award },
  { title: 'Resources', href: '/resources', icon: Bookmark },
  { title: 'History', href: '/history', icon: History },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { title: 'Settings', href: '/settings', icon: Settings },
  { title: 'Profile', href: '/profile', icon: User },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r border-border bg-surface text-foreground select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-5">
        <Link href="/" className="flex items-center space-x-2.5 font-bold tracking-tight text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black font-black text-xs">
            DL
          </div>
          <span className="text-base tracking-wider font-mono">DevLearn</span>
        </Link>
        <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-mono text-foreground-secondary border border-border">
          MVP
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-foreground-muted">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-surface-elevated text-white border border-border'
                  : 'text-foreground-secondary hover:bg-surface-elevated hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-foreground-secondary" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        {user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
          <div className="pt-2">
            <Link
              href="/admin/overview"
              className={cn(
                'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors border border-neutral-700 bg-neutral-900/60 text-neutral-200 hover:text-white hover:bg-neutral-800'
              )}
            >
              <Shield className="h-4 w-4 shrink-0 text-white" />
              <span className="font-semibold text-white">Admin Portal</span>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom User & Logout Bar */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center justify-between rounded-md bg-surface-elevated/60 px-3 py-2 text-xs border border-border">
          <span className="flex items-center gap-1.5 font-mono text-foreground-secondary text-[11px]">
            <Flame className="h-3.5 w-3.5 text-white" />
            Streak Active
          </span>
          <span className="font-mono text-white text-[11px] truncate max-w-[90px]">
            {user?.name || user?.email?.split('@')[0] || 'Learner'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center space-x-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-mono text-foreground-secondary hover:bg-state-error/10 hover:text-state-error hover:border-state-error/40 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Confirm Sign Out"
        description="Are you sure you want to log out of your DevLearn account?"
        confirmLabel="Log Out"
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
