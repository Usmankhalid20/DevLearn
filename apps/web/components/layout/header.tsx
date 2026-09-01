'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  BarChart3,
  ChevronDown,
  ShieldCheck,
  Shield,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { cn } from '@/lib/utils';

export function Header({ title = 'Dashboard' }: { title?: string }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Compute initials
  const initials = React.useMemo(() => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'DL';
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface/90 px-6 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <h1 className="text-sm font-semibold tracking-tight text-white font-mono">{title}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-elevated/40 text-foreground-secondary hover:text-white hover:border-border-hover transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border" />

        {/* Circular Avatar Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className={cn(
              'flex items-center gap-2 rounded-full border border-border bg-surface-elevated/80 py-1 pl-1 pr-2.5 transition-all hover:border-border-hover hover:bg-surface-elevated focus:outline-none focus:ring-1 focus:ring-white',
              dropdownOpen && 'border-white/60 ring-1 ring-white/20'
            )}
          >
            {/* Circular Avatar Badge or Image */}
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-black font-mono text-[11px] font-bold shadow-sm overflow-hidden">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <span className="hidden text-xs font-mono text-foreground sm:inline-block max-w-[130px] truncate">
              {user?.name || user?.email?.split('@')[0] || 'Learner'}
            </span>

            <ChevronDown
              className={cn(
                'h-3 w-3 text-foreground-secondary transition-transform duration-200',
                dropdownOpen && 'rotate-180 text-white'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg border border-border bg-surface-elevated p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 z-50 font-mono text-xs"
              role="menu"
              aria-orientation="vertical"
            >
              {/* User Identity Header */}
              <div className="border-b border-border/80 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white truncate text-[13px]">
                    {user?.name || 'DevLearn User'}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[9px] text-foreground-secondary border border-border">
                    <ShieldCheck className="h-3 w-3 text-white" />
                    {user?.isEmailVerified ? 'Verified' : 'Active'}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted truncate mt-0.5">
                  {user?.email || 'user@devlearn.io'}
                </p>
              </div>

              {/* Navigation Menu Links */}
              <div className="py-1.5 space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-foreground-secondary hover:bg-surface hover:text-white transition-colors"
                  role="menuitem"
                >
                  <User className="h-3.5 w-3.5 text-foreground-muted" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-foreground-secondary hover:bg-surface hover:text-white transition-colors"
                  role="menuitem"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-foreground-muted" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/analytics"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-foreground-secondary hover:bg-surface hover:text-white transition-colors"
                  role="menuitem"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-foreground-muted" />
                  <span>Analytics &amp; Streaks</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-foreground-secondary hover:bg-surface hover:text-white transition-colors"
                  role="menuitem"
                >
                  <Settings className="h-3.5 w-3.5 text-foreground-muted" />
                  <span>Learning Settings</span>
                </Link>

                {user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                  <Link
                    href="/admin/overview"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors border-t border-border/40 mt-1 pt-2"
                    role="menuitem"
                  >
                    <Shield className="h-3.5 w-3.5 text-white" />
                    <span className="font-semibold text-white">Admin Portal</span>
                  </Link>
                )}
              </div>

              {/* Logout Action */}
              <div className="border-t border-border/80 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-state-error hover:bg-state-error/10 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmLabel="Log Out"
        variant="danger"
        icon="logout"
        onConfirm={async () => {
          setShowLogoutModal(false);
          await logout();
        }}
      />
    </header>
  );
}
