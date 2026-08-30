'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUsersQueryParams } from '@/lib/admin-api';
import { showToast } from '@/lib/toast';
import { formatErrorMessage } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  UserX,
  RotateCcw,
  Trash2,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  LogOut,
  Eye,
} from 'lucide-react';
import type { UserRole, UserStatus, AdminUserListItemDto } from '@devlearn/types';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  const [queryParams, setQueryParams] = React.useState<AdminUsersQueryParams>({
    page: 1,
    limit: 15,
    search: '',
  });

  const [searchInput, setSearchInput] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<AdminUserListItemDto | null>(null);
  const [actionModal, setActionModal] = React.useState<'ROLE' | 'STATUS' | 'REVOKE' | 'DELETE' | null>(null);

  // Form states for modals
  const [targetRole, setTargetRole] = React.useState<UserRole>('USER');
  const [targetStatus, setTargetStatus] = React.useState<UserStatus>('ACTIVE');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setQueryParams((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Query users
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'users', queryParams],
    queryFn: () => adminApi.getUsers(queryParams),
  });

  // Mutation: Update User Role/Status
  const updateMutation = useMutation({
    mutationFn: (payload: { userId: string; role?: UserRole; status?: UserStatus }) =>
      adminApi.updateUser(payload.userId, { role: payload.role, status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      showToast.success('User updated successfully.');
      setActionModal(null);
      setSelectedUser(null);
    },
    onError: (err) => {
      showToast.error(err);
    },
  });

  // Mutation: Revoke Sessions
  const revokeMutation = useMutation({
    mutationFn: (userId: string) => adminApi.revokeSessions(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast.success(res.message || 'Active sessions revoked.');
      setActionModal(null);
      setSelectedUser(null);
    },
    onError: (err) => {
      showToast.error(err);
    },
  });

  // Mutation: Delete User
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      showToast.success('User account deleted.');
      setActionModal(null);
      setSelectedUser(null);
    },
    onError: (err) => {
      showToast.error(err);
    },
  });

  const openRoleModal = (u: AdminUserListItemDto) => {
    setSelectedUser(u);
    setTargetRole(u.role);
    setActionModal('ROLE');
  };

  const openStatusModal = (u: AdminUserListItemDto) => {
    setSelectedUser(u);
    setTargetStatus(u.status);
    setActionModal('STATUS');
  };

  const openRevokeModal = (u: AdminUserListItemDto) => {
    setSelectedUser(u);
    setActionModal('REVOKE');
  };

  const openDeleteModal = (u: AdminUserListItemDto) => {
    setSelectedUser(u);
    setActionModal('DELETE');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white">
            User Directory & Moderation
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Manage roles, account statuses, active sessions, and learner records
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border bg-surface">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 font-mono text-xs bg-base border-border"
              />
            </div>

            {/* Filter by Role */}
            <div className="w-full md:w-44">
              <Select
                value={queryParams.role || ''}
                onChange={(e) =>
                  setQueryParams((prev) => ({
                    ...prev,
                    role: (e.target.value as UserRole) || undefined,
                    page: 1,
                  }))
                }
                className="h-9 font-mono text-xs bg-base border-border"
              >
                <option value="">All Roles</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </Select>
            </div>

            {/* Filter by Status */}
            <div className="w-full md:w-44">
              <Select
                value={queryParams.status || ''}
                onChange={(e) =>
                  setQueryParams((prev) => ({
                    ...prev,
                    status: (e.target.value as UserStatus) || undefined,
                    page: 1,
                  }))
                }
                className="h-9 font-mono text-xs bg-base border-border"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BANNED">BANNED</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-border bg-surface-elevated text-foreground-secondary">
              <tr>
                <th className="p-3.5 pl-4 font-semibold">User</th>
                <th className="p-3.5 font-semibold">Role</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Activity</th>
                <th className="p-3.5 font-semibold">Joined</th>
                <th className="p-3.5 pr-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-foreground-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                      <span>Loading user accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : !data || data.users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-foreground-secondary">
                    No users found matching the query criteria.
                  </td>
                </tr>
              ) : (
                data.users.map((u) => {
                  const isSelf = currentAdmin?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-surface-elevated/40 transition-colors">
                      {/* Name & Email */}
                      {/* Name & Email */}
                      <td className="p-3.5 pl-4">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-[11px] font-bold text-white uppercase shrink-0 group-hover:border-neutral-500">
                            {u.name ? u.name.slice(0, 2) : u.email.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white group-hover:underline truncate max-w-[200px]">
                              {u.name || 'Unnamed Learner'}
                              {isSelf && (
                                <span className="ml-1.5 text-[10px] text-neutral-400 font-normal">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-foreground-secondary truncate max-w-[200px]">
                              {u.email}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-mono ${
                            u.role === 'SUPERADMIN'
                              ? 'border-white text-white bg-white/10'
                              : u.role === 'ADMIN'
                              ? 'border-neutral-400 text-neutral-200 bg-neutral-800'
                              : 'border-border text-foreground-secondary'
                          }`}
                        >
                          {u.role}
                        </Badge>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-mono ${
                            u.status === 'ACTIVE'
                              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                              : u.status === 'SUSPENDED'
                              ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                              : 'border-state-error/50 text-state-error bg-state-error/10'
                          }`}
                        >
                          {u.status}
                        </Badge>
                      </td>

                      {/* Activity Counts */}
                      <td className="p-3.5 text-foreground-secondary text-[11px]">
                        <div>{u._count.learningSessions} sessions</div>
                        <div className="text-neutral-500">
                          {u._count.subjects} subjects • {u._count.tasks} tasks
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="p-3.5 text-foreground-secondary text-[11px] whitespace-nowrap">
                        {u.createdAt.slice(0, 10)}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect User */}
                          <Link
                            href={`/admin/users/${u.id}`}
                            title="Inspect User Details"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-xs font-mono text-foreground-secondary hover:bg-neutral-800 hover:text-white transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          {/* Role edit button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleModal(u)}
                            disabled={isSelf}
                            title="Edit Role"
                            className="h-7 px-2 text-xs font-mono hover:bg-neutral-800 hover:text-white"
                          >
                            <Shield className="h-3.5 w-3.5" />
                          </Button>

                          {/* Status toggle button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStatusModal(u)}
                            disabled={isSelf}
                            title="Toggle Status"
                            className="h-7 px-2 text-xs font-mono hover:bg-neutral-800 hover:text-amber-400"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>

                          {/* Force Revoke Sessions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRevokeModal(u)}
                            title="Revoke Sessions"
                            className="h-7 px-2 text-xs font-mono hover:bg-neutral-800 hover:text-neutral-200"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete Account */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(u)}
                            disabled={isSelf}
                            title="Delete Account"
                            className="h-7 px-2 text-xs font-mono text-state-error hover:bg-state-error/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-3.5 px-4 bg-surface text-xs font-mono">
            <span className="text-foreground-secondary">
              Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalCount} total users)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQueryParams((p) => ({ ...p, page: Math.max(1, p.page! - 1) }))}
                disabled={queryParams.page === 1 || isFetching}
                className="h-7 px-2.5 font-mono text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQueryParams((p) => ({ ...p, page: p.page! + 1 }))}
                disabled={queryParams.page! >= data.pagination.totalPages || isFetching}
                className="h-7 px-2.5 font-mono text-xs gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL 1: Role Change */}
      <Dialog
        open={actionModal === 'ROLE'}
        onOpenChange={(open) => {
          if (!open) setActionModal(null);
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Update User Role
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary">
            Change access privileges for <span className="text-white font-semibold">{selectedUser?.email}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-3 space-y-3">
          <label className="text-xs font-mono text-foreground-secondary">Select New Role</label>
          <Select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as UserRole)}
            className="w-full font-mono text-xs bg-base border-border"
          >
            <option value="USER">USER — Standard learner privileges</option>
            <option value="ADMIN">ADMIN — Administrative & moderation access</option>
            <option value="SUPERADMIN">SUPERADMIN — Full system control</option>
          </Select>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionModal(null)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (selectedUser) {
                updateMutation.mutate({ userId: selectedUser.id, role: targetRole });
              }
            }}
            disabled={updateMutation.isPending}
            className="font-mono text-xs"
          >
            {updateMutation.isPending ? 'Saving...' : 'Confirm Role Change'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* MODAL 2: Status Change */}
      <Dialog
        open={actionModal === 'STATUS'}
        onOpenChange={(open) => {
          if (!open) setActionModal(null);
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <Ban className="h-4 w-4 text-amber-400" />
            Update Account Status
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary">
            Toggle account state for <span className="text-white font-semibold">{selectedUser?.email}</span>.
            Suspending or banning will terminate all their active sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-3 space-y-3">
          <label className="text-xs font-mono text-foreground-secondary">Select Status</label>
          <Select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as UserStatus)}
            className="w-full font-mono text-xs bg-base border-border"
          >
            <option value="ACTIVE">ACTIVE — Normal login and study tracking</option>
            <option value="SUSPENDED">SUSPENDED — Temporary block</option>
            <option value="BANNED">BANNED — Permanent account ban</option>
          </Select>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionModal(null)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (selectedUser) {
                updateMutation.mutate({ userId: selectedUser.id, status: targetStatus });
              }
            }}
            disabled={updateMutation.isPending}
            className="font-mono text-xs"
          >
            {updateMutation.isPending ? 'Saving...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* MODAL 3: Revoke Sessions */}
      <Dialog
        open={actionModal === 'REVOKE'}
        onOpenChange={(open) => {
          if (!open) setActionModal(null);
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <LogOut className="h-4 w-4 text-neutral-200" />
            Revoke Active Sessions
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary">
            Force sign out <span className="text-white font-semibold">{selectedUser?.email}</span> from all active browsers and devices.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionModal(null)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (selectedUser) {
                revokeMutation.mutate(selectedUser.id);
              }
            }}
            disabled={revokeMutation.isPending}
            className="font-mono text-xs"
          >
            {revokeMutation.isPending ? 'Revoking...' : 'Revoke All Sessions'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* MODAL 4: Delete User Account */}
      <Dialog
        open={actionModal === 'DELETE'}
        onOpenChange={(open) => {
          if (!open) setActionModal(null);
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-state-error flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete User Account
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary leading-relaxed">
            Are you sure you want to permanently delete the account for{' '}
            <span className="text-white font-semibold">{selectedUser?.email}</span>?
            All learning sessions, tasks, subjects, goals, and history will be irreversibly removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionModal(null)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (selectedUser) {
                deleteMutation.mutate(selectedUser.id);
              }
            }}
            disabled={deleteMutation.isPending}
            className="font-mono text-xs"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
