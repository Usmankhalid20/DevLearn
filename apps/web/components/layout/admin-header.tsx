'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LogOut,
  ChevronDown,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { cn } from '@/lib/utils';

export function AdminHeader() {
  const pathname = usePathname();
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPageTitle = () => {
    if (pathname?.includes('/admin/overview')) return 'Platform Overview & KPIs';
    if (pathname?.includes('/admin/users/')) return 'User Inspection & Moderation';
    if (pathname?.includes('/admin/users')) return 'Learner Accounts Directory';
    if (pathname?.includes('/admin/administrators')) return 'Administrator Management';
    if (pathname?.includes('/admin/permissions')) return 'Role & Capability Matrix';
    if (pathname?.includes('/admin/activity')) return 'Platform Learning Activity';
    if (pathname?.includes('/admin/resources')) return 'Learning Resources Catalog';
    if (pathname?.includes('/admin/telemetry')) return 'Live System Telemetry';
    if (pathname?.includes('/admin/audit-logs')) return 'Security Audit Trail';
    if (pathname?.includes('/admin/settings')) return 'Platform Settings & Policies';
    return 'Admin Console';
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-[#0e0f11] px-6 select-none shrink-0">
      {/* Left: Section Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-neutral-400 font-medium hidden sm:inline">Admin</span>
          <span className="font-mono text-xs text-neutral-500 hidden sm:inline">/</span>
          <h1 className="text-sm font-semibold text-white font-mono tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Operational Status & Admin Profile */}
      <div className="flex items-center space-x-4">
        {/* System Health Status Indicator */}
        {/* <div className="hidden lg:flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-[11px] font-mono text-neutral-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Services Operational</span>
        </div> */}

        <div className="hidden sm:block h-4 w-[1px] bg-neutral-800" />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2.5 rounded-lg p-1.5 hover:bg-neutral-800/60 transition-colors border border-transparent hover:border-neutral-700/60"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-white text-xs font-mono font-semibold">
              <Shield className="h-3.5 w-3.5 text-neutral-200" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-mono text-white truncate max-w-[130px] font-medium leading-tight">
                {user?.name || user?.email?.split('@')[0] || 'Admin'}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 leading-none uppercase">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-64 rounded-lg border border-neutral-800 bg-[#121316] p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 text-xs font-mono"
              role="menu"
            >
              {/* Profile details */}
              <div className="px-3 py-2.5 border-b border-neutral-800">
                <p className="font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300 border border-neutral-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Role: {user?.role || 'ADMIN'}</span>
                </div>
              </div>

              {/* Navigation quick links */}
              <div className="py-1.5 space-y-0.5">
                <Link
                  href="/admin/overview"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <Activity className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Platform Overview</span>
                </Link>

                <Link
                  href="/admin/telemetry"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <Lock className="h-3.5 w-3.5 text-neutral-500" />
                  <span>System Diagnostics</span>
                </Link>
              </div>

              {/* Sign out */}
              <div className="border-t border-neutral-800 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-red-400 hover:bg-red-950/30 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Sign Out of Admin Console"
        description="Are you sure you want to sign out of your administrative session? You will be redirected to the login screen."
        confirmLabel="Sign Out"
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
