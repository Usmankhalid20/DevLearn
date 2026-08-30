'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { showToast } from '@/lib/toast';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Key,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Info,
  UserPlus,
  Search,
  User,
  Plus,
} from 'lucide-react';
import type { AdministratorDto, AdminPermission, AdminUserListItemDto } from '@devlearn/types';

const ALL_PERMISSIONS: { key: AdminPermission; category: string; description: string }[] = [
  { key: 'view_users', category: 'Users', description: 'Browse and search registered learners directory' },
  { key: 'manage_users', category: 'Users', description: 'Edit user metadata, name, and email verification' },
  { key: 'suspend_users', category: 'Users', description: 'Suspend user accounts and revoke active sessions' },
  { key: 'restore_users', category: 'Users', description: 'Reactivate suspended or disabled accounts' },
  { key: 'view_learning_activity', category: 'Content', description: 'Inspect platform-wide learning sessions overview' },
  { key: 'view_resources', category: 'Content', description: 'View curriculum bookmarks and learning resource index' },
  { key: 'manage_resources', category: 'Content', description: 'Update resource metadata and categorize links' },
  { key: 'moderate_resources', category: 'Content', description: 'Remove broken or flagged resource URLs' },
  { key: 'view_platform_analytics', category: 'Analytics', description: 'View platform KPI dashboards and growth charts' },
  { key: 'view_system_health', category: 'Telemetry', description: 'Access live DB latency and memory diagnostics' },
  { key: 'view_audit_logs', category: 'Audit', description: 'Inspect immutable administrative audit trail' },
  { key: 'view_settings', category: 'Settings', description: 'View platform operational settings' },
  { key: 'manage_settings', category: 'Settings', description: 'Modify platform settings and maintenance mode' },
];

export default function PermissionsMatrixPage() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = usePermissions();

  // Assign Permissions Modal State
  const [grantModalOpen, setGrantModalOpen] = React.useState(false);
  const [userSearch, setUserSearch] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<AdminUserListItemDto | null>(null);
  const [modalPermissions, setModalPermissions] = React.useState<AdminPermission[]>([
    'view_users',
    'view_platform_analytics',
  ]);

  // Fetch Administrators
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-administrators-list'],
    queryFn: () => adminApi.getAdministrators(),
    enabled: isSuperAdmin,
  });

  // Query users for assignment modal
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin-search-users-for-permissions', userSearch],
    queryFn: () => adminApi.getUsers({ search: userSearch || undefined, limit: 10 }),
    enabled: grantModalOpen && isSuperAdmin,
  });

  // Update permissions on existing admin
  const updatePermissionsMutation = useMutation({
    mutationFn: ({ adminId, permissions }: { adminId: string; permissions: AdminPermission[] }) =>
      adminApi.updateAdminPermissions(adminId, permissions),
    onSuccess: (res) => {
      showToast.success(res.message || 'Permissions updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-administrators-list'] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to update permissions.');
    },
  });

  // Promote user & assign permissions
  const assignUserMutation = useMutation({
    mutationFn: () => {
      if (!selectedUser) throw new Error('No user selected');
      return adminApi.updateUser(selectedUser.id, {
        role: 'ADMIN',
        permissions: modalPermissions,
      });
    },
    onSuccess: () => {
      showToast.success(`Assigned permissions to ${selectedUser?.name || selectedUser?.email}.`);
      setGrantModalOpen(false);
      setSelectedUser(null);
      setUserSearch('');
      queryClient.invalidateQueries({ queryKey: ['admin-administrators-list'] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to assign permissions to user.');
    },
  });

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <ShieldAlert className="h-8 w-8 mx-auto text-state-error" />
        <h2 className="text-base font-mono font-bold text-white">403 — Super Administrator Access Required</h2>
        <p className="text-xs font-mono text-foreground-secondary">
          Only Super Administrators can inspect or configure the platform permission matrix.
        </p>
      </div>
    );
  }

  const toggleAdminPermission = (admin: AdministratorDto, permKey: AdminPermission) => {
    const isSuper = admin.role === 'SUPER_ADMIN' || admin.role === 'SUPERADMIN';
    if (isSuper) {
      showToast.info('Super Administrators automatically possess all capabilities.');
      return;
    }

    const current = admin.permissions || [];
    const next = current.includes(permKey)
      ? current.filter((p) => p !== permKey)
      : [...current, permKey];

    updatePermissionsMutation.mutate({ adminId: admin.id, permissions: next });
  };

  const toggleModalPermission = (permKey: AdminPermission) => {
    setModalPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const normalAdmins = (data?.administrators || []).filter(
    (a) => a.role !== 'SUPER_ADMIN' && a.role !== 'SUPERADMIN'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-white" />
            Permission Matrix
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Role-Based Access Control matrix and granular capability assignments.
          </p>
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
            <span>Refresh Matrix</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setGrantModalOpen(true)}
            className="font-mono text-xs gap-1.5 bg-white text-black hover:bg-neutral-200 font-semibold"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Grant User Permissions</span>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="flex items-start gap-3 rounded-lg border border-neutral-700 bg-surface p-4 text-xs font-mono text-neutral-300">
        <Info className="h-4 w-4 shrink-0 text-white mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">How Super Admins Assign Permissions</p>
          <p className="text-foreground-secondary leading-relaxed">
            Super Administrators can assign individual permissions to any user or administrator. Click <strong>Grant User Permissions</strong> to select a registered user and assign them specific capabilities. Once added to the matrix, click any cell (<CheckCircle2 className="h-3 w-3 inline text-emerald-400" /> / <XCircle className="h-3 w-3 inline text-neutral-500" />) to instantly toggle capabilities.
          </p>
        </div>
      </div>

      {/* Matrix Table */}
      <Card className="border-border bg-surface shadow-md">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-mono font-semibold text-white">
                Capability &amp; Authorization Matrix
              </CardTitle>
              <CardDescription className="text-xs font-mono text-foreground-secondary">
                Click any cell to immediately grant or revoke a permission.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-neutral-700 bg-neutral-900">
              {normalAdmins.length} Active Assigned Admins
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-xs font-mono text-state-error">
              Failed to load administrators.
            </div>
          ) : normalAdmins.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 mx-auto text-white">
                <Key className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white text-sm">No Restricted Administrators Assigned Yet</p>
                <p className="text-foreground-secondary max-w-md mx-auto">
                  You are logged in as Super Admin (unrestricted platform access). You can promote any registered user or learner to Admin and grant them a customized permission bundle.
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setGrantModalOpen(true)}
                className="font-mono text-xs gap-1.5 bg-white text-black hover:bg-neutral-200 font-semibold mx-auto"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Grant Permissions to a User</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-surface-elevated/40 text-[11px] font-mono text-foreground-secondary uppercase tracking-wider">
                    <th className="p-3.5 pl-4 min-w-[240px]">Permission Key</th>
                    <th className="p-3.5 min-w-[100px]">Category</th>
                    {normalAdmins.map((admin) => (
                      <th key={admin.id} className="p-3.5 text-center min-w-[150px]">
                        <div className="truncate max-w-[140px] font-semibold text-white">
                          {admin.name || admin.email.split('@')[0]}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-normal truncate max-w-[140px]">
                          {admin.email}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs font-mono">
                  {ALL_PERMISSIONS.map((perm) => (
                    <tr key={perm.key} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-3.5 pl-4">
                        <p className="font-semibold text-white">{perm.key}</p>
                        <p className="text-[11px] text-foreground-secondary">{perm.description}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700">
                          {perm.category}
                        </span>
                      </td>
                      {normalAdmins.map((admin) => {
                        const hasPerm = (admin.permissions || []).includes(perm.key);
                        return (
                          <td key={admin.id} className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAdminPermission(admin, perm.key)}
                              disabled={updatePermissionsMutation.isPending}
                              title={hasPerm ? `Revoke ${perm.key}` : `Grant ${perm.key}`}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded border transition-colors ${
                                hasPerm
                                  ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80'
                                  : 'border-border bg-surface text-neutral-600 hover:border-neutral-500 hover:text-white'
                              }`}
                            >
                              {hasPerm ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4 opacity-40" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GRANT PERMISSIONS TO USER MODAL */}
      <Dialog open={grantModalOpen} onOpenChange={setGrantModalOpen}>
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <Key className="h-4 w-4" />
            Grant Permissions to User / Promote to Admin
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary">
            Select a registered learner or administrator and configure their capability bundle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1: User Picker */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-white">
              1. Select User / Learner
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
              <Input
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 bg-surface font-mono text-xs"
              />
            </div>

            {/* Users List Box */}
            <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-surface p-1 space-y-1">
              {isUsersLoading ? (
                <div className="p-4 text-center text-xs font-mono text-foreground-muted">
                  Searching users...
                </div>
              ) : (usersData?.users || []).length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-foreground-muted">
                  No users found matching search.
                </div>
              ) : (
                usersData?.users.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        if (u.permissions && u.permissions.length > 0) {
                          setModalPermissions(u.permissions as AdminPermission[]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded text-left text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-neutral-800 border border-neutral-700 text-white font-medium'
                          : 'hover:bg-surface-elevated text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-3.5 w-3.5 shrink-0 text-foreground-muted" />
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{u.name || u.email.split('@')[0]}</p>
                          <p className="text-[10px] text-foreground-secondary truncate">{u.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-mono border-neutral-700">
                        {u.role}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Permissions Checkbox Grid */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-mono font-semibold text-white">
              2. Select Permissions to Assign
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {ALL_PERMISSIONS.map((p) => {
                const isChecked = modalPermissions.includes(p.key);
                return (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => toggleModalPermission(p.key)}
                    className={`flex items-center gap-2 p-2 rounded border text-left text-xs font-mono transition-colors ${
                      isChecked
                        ? 'border-white bg-neutral-800 text-white font-medium'
                        : 'border-border bg-surface text-foreground-secondary hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-border bg-base text-white"
                    />
                    <div className="truncate">
                      <p className="font-medium text-white truncate">{p.key}</p>
                      <p className="text-[10px] text-foreground-muted truncate">{p.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGrantModalOpen(false)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => assignUserMutation.mutate()}
            disabled={assignUserMutation.isPending || !selectedUser}
            className="font-mono text-xs bg-white text-black hover:bg-neutral-200 font-semibold"
          >
            {assignUserMutation.isPending ? 'Assigning...' : 'Assign Permissions & Add to Matrix'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
