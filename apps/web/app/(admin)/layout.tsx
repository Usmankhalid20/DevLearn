'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
          <p className="text-xs font-mono text-foreground-secondary">
            Verifying administrative credentials...
          </p>
        </div>
      </div>
    );
  }

  // Access Denied if not authenticated or not ADMIN/SUPERADMIN
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base p-4">
        <div className="w-full max-w-md rounded-xl border border-state-error/40 bg-surface p-6 shadow-2xl text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-state-error/10 text-state-error">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-mono text-white">403 — Access Forbidden</h1>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Administrative privileges are required to access the Admin Portal. Your current role is{' '}
              <span className="font-mono text-white font-semibold">{user?.role || 'UNAUTHENTICATED'}</span>.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="w-full font-mono text-xs gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Learner Portal
            </Button>
            {!isAuthenticated && (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/login')}
                className="w-full font-mono text-xs"
              >
                Sign In with Admin Account
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Persistent Admin Sidebar */}
      <AdminSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
