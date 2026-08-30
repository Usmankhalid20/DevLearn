'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  ArrowLeft,
  Shield,
  User,
  Clock,
  BookOpen,
  CheckSquare,
  Target,
  GraduationCap,
  Ban,
  LogOut,
  Trash2,
  Calendar,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  const [revokeModalOpen, setRevokeModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = React.useState(false);

  const isSelf = currentAdmin?.id === userId;

  const {
    data: user,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => adminApi.getUserDetails(userId),
    enabled: Boolean(userId),
  });

  const { can, isSuperAdmin } = usePermissions();

  const updateUserMutation = useMutation({
    mutationFn: (payload: { role?: any; status?: any; isEmailVerified?: boolean }) =>
      adminApi.updateUser(userId, payload),
    onSuccess: (res) => {
      showToast.success(res.message || 'User updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to update user.');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => adminApi.revokeSessions(userId),
    onSuccess: () => {
      showToast.success('All active sessions for this user have been terminated.');
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to revoke sessions.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(userId),
    onSuccess: () => {
      showToast.success('User account permanently deleted.');
      router.push('/admin/users');
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to delete user.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
          <span className="font-mono text-xs text-foreground-secondary">
            Loading user profile &amp; learning metrics...
          </span>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-4">
        <p className="font-mono text-sm text-state-error font-semibold">User account not found or error loading details.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/users')}
          className="font-mono text-xs gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to User Directory
        </Button>
      </div>
    );
  }

  const roleColor =
    user.role === 'SUPERADMIN'
      ? 'bg-neutral-800 text-white border-neutral-600'
      : user.role === 'ADMIN'
      ? 'bg-neutral-900 text-neutral-200 border-neutral-700'
      : 'bg-surface-elevated text-foreground-secondary border-border';

  const statusColor =
    user.status === 'ACTIVE'
      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
      : user.status === 'SUSPENDED'
      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
      : 'bg-red-950/60 text-red-300 border-red-800/60';

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground-secondary hover:bg-surface-elevated hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
              {user.name || user.email.split('@')[0]}
            </h1>
            <p className="text-xs font-mono text-foreground-secondary">
              ID: {user.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="font-mono text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevokeModalOpen(true)}
            disabled={revokeMutation.isPending}
            className="font-mono text-xs gap-1.5 hover:text-state-error"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Revoke Sessions</span>
          </Button>

          {!isSelf && isSuperAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleteMutation.isPending}
              className="font-mono text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete User</span>
            </Button>
          )}
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface border-border">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-foreground-secondary">
              <span className="text-xs font-mono uppercase tracking-wider">Account Role</span>
              <Shield className="h-4 w-4 text-foreground-muted" />
            </div>
            <div className="pt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono border ${roleColor}`}>
                {user.role}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-foreground-secondary">
              <span className="text-xs font-mono uppercase tracking-wider">Account Status</span>
              <Ban className="h-4 w-4 text-foreground-muted" />
            </div>
            <div className="pt-1 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono border ${statusColor}`}>
                {user.status}
              </span>
              {!isSelf && can('suspend_users') && (
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(true)}
                  disabled={updateUserMutation.isPending}
                  className="text-[11px] font-mono text-neutral-400 hover:text-white underline underline-offset-2"
                >
                  {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-foreground-secondary">
              <span className="text-xs font-mono uppercase tracking-wider">Email Verification</span>
              <Mail className="h-4 w-4 text-foreground-muted" />
            </div>
            <div className="pt-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {user.isEmailVerified ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-neutral-500" />
                    Unverified
                  </span>
                )}
              </div>
              {can('manage_users') && (
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(true)}
                  disabled={updateUserMutation.isPending}
                  className="text-[11px] font-mono text-neutral-400 hover:text-white underline underline-offset-2"
                >
                  {user.isEmailVerified ? 'Mark Unverified' : 'Mark Verified'}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-foreground-secondary">
              <span className="text-xs font-mono uppercase tracking-wider">Registered Since</span>
              <Calendar className="h-4 w-4 text-foreground-muted" />
            </div>
            <div className="pt-1">
              <p className="font-mono text-xs text-white">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Activity Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border bg-surface p-3 text-center">
          <Clock className="h-4 w-4 mx-auto text-foreground-muted mb-1" />
          <p className="text-lg font-bold font-mono text-white">{user._count?.learningSessions || 0}</p>
          <p className="text-[11px] font-mono text-foreground-secondary">Sessions</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 text-center">
          <BookOpen className="h-4 w-4 mx-auto text-foreground-muted mb-1" />
          <p className="text-lg font-bold font-mono text-white">{user._count?.subjects || 0}</p>
          <p className="text-[11px] font-mono text-foreground-secondary">Subjects</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 text-center">
          <CheckSquare className="h-4 w-4 mx-auto text-foreground-muted mb-1" />
          <p className="text-lg font-bold font-mono text-white">{user._count?.tasks || 0}</p>
          <p className="text-[11px] font-mono text-foreground-secondary">Tasks</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 text-center">
          <Target className="h-4 w-4 mx-auto text-foreground-muted mb-1" />
          <p className="text-lg font-bold font-mono text-white">{user._count?.goals || 0}</p>
          <p className="text-[11px] font-mono text-foreground-secondary">Goals</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3 text-center col-span-2 sm:col-span-1">
          <GraduationCap className="h-4 w-4 mx-auto text-foreground-muted mb-1" />
          <p className="text-lg font-bold font-mono text-white">{user._count?.courses || 0}</p>
          <p className="text-[11px] font-mono text-foreground-secondary">Courses</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Sessions & Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Learning Sessions */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-mono font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-foreground-muted" />
              Recent Learning Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {(!user.learningSessions || user.learningSessions.length === 0) ? (
              <p className="text-xs font-mono text-foreground-secondary py-6 text-center">
                No learning sessions recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {user.learningSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-2.5 rounded-md bg-surface-elevated/50 border border-border/60 text-xs font-mono"
                  >
                    <div>
                      <p className="font-semibold text-white truncate max-w-[200px]">
                        {session.subject?.name || 'Unassigned Subject'}
                      </p>
                      <p className="text-[11px] text-foreground-muted">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-200">
                        {session.durationMinutes} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects & Curriculum */}
        <Card className="bg-surface border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-mono font-semibold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-foreground-muted" />
              Created Subjects &amp; Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {(!user.subjects || user.subjects.length === 0) ? (
              <p className="text-xs font-mono text-foreground-secondary py-6 text-center">
                No learning subjects created yet.
              </p>
            ) : (
              <div className="space-y-2">
                {user.subjects.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2.5 rounded-md bg-surface-elevated/50 border border-border/60 text-xs font-mono"
                  >
                    <div>
                      <p className="font-semibold text-white truncate max-w-[200px]">{sub.name}</p>
                      <p className="text-[11px] text-foreground-muted truncate max-w-[220px]">
                        {sub.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-foreground-secondary">
                      <span>{sub._count?.learningSessions || 0} sessions</span>
                      <span>•</span>
                      <span>{sub._count?.tasks || 0} tasks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* REVOKE SESSIONS CONFIRM MODAL */}
      <ConfirmModal
        open={revokeModalOpen}
        onOpenChange={setRevokeModalOpen}
        title="Revoke Active Login Sessions"
        description={`Are you sure you want to terminate all active sessions for ${user.email}? The user will be immediately signed out of all devices and active browsers.`}
        confirmLabel="Revoke All Sessions"
        variant="danger"
        icon="logout"
        isLoading={revokeMutation.isPending}
        onConfirm={async () => {
          setRevokeModalOpen(false);
          await revokeMutation.mutateAsync();
        }}
      />

      {/* DELETE USER ACCOUNT CONFIRM MODAL */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Permanently Delete User Account"
        description={`Are you sure you want to permanently delete account ${user.email}? All learning sessions, subjects, goals, tasks, and achievements associated with this account will be erased forever. This action cannot be undone.`}
        confirmLabel="Delete Account Permanently"
        variant="danger"
        icon="delete"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          setDeleteModalOpen(false);
          await deleteMutation.mutateAsync();
        }}
      />

      {/* STATUS CHANGE CONFIRM MODAL */}
      <ConfirmModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        title={user.status === 'ACTIVE' ? 'Suspend User Account' : 'Activate User Account'}
        description={
          user.status === 'ACTIVE'
            ? `Suspending ${user.email} will immediately revoke their access and terminate all active sessions.`
            : `Re-activating ${user.email} will restore their standard portal access.`
        }
        confirmLabel={user.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
        variant={user.status === 'ACTIVE' ? 'warning' : 'default'}
        icon="warning"
        isLoading={updateUserMutation.isPending}
        onConfirm={async () => {
          setStatusModalOpen(false);
          const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          await updateUserMutation.mutateAsync({ status: nextStatus });
        }}
      />

      {/* EMAIL VERIFICATION OVERRIDE CONFIRM MODAL */}
      <ConfirmModal
        open={verifyModalOpen}
        onOpenChange={setVerifyModalOpen}
        title="Override Email Verification Status"
        description={`Manually update the email verification flag for ${user.email} to ${
          user.isEmailVerified ? 'Unverified' : 'Verified'
        }? This administrative override will be logged in the security audit trail.`}
        confirmLabel={user.isEmailVerified ? 'Mark as Unverified' : 'Mark as Verified'}
        variant="default"
        icon="info"
        isLoading={updateUserMutation.isPending}
        onConfirm={async () => {
          setVerifyModalOpen(false);
          await updateUserMutation.mutateAsync({ isEmailVerified: !user.isEmailVerified });
        }}
      />
    </div>
  );
}
