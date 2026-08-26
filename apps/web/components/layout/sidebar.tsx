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
  Settings,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Learning', href: '/learning', icon: BookOpen },
  { title: 'Tasks', href: '/tasks', icon: CheckSquare },
  { title: 'Resources', href: '/resources', icon: Bookmark },
  { title: 'History', href: '/history', icon: History },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

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
      </div>

      {/* Bottom Summary Bar */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between text-xs text-foreground-secondary">
          <span className="flex items-center gap-1.5 font-mono">
            <Flame className="h-3.5 w-3.5 text-white" />
            Streak
          </span>
          <span className="font-mono text-white font-semibold">0 days</span>
        </div>
      </div>
    </aside>
  );
}
