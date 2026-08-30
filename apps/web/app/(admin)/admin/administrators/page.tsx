'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Key,
  Ban,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Clock,
  Terminal,
} from 'lucide-react';
import type { AdministratorDto, AdminPermission } from '@devlearn/types';

const PERMISSIONS_CATEGORIES = [
  {
    category: 'Users',
    permissions: [
      { key: 'view_users' as AdminPermission, label: 'View Users Directory' },
      { key: 'manage_users' as AdminPermission, label: 'Manage & Edit Users' },
      { key: 'suspend_users' as AdminPermission, label: 'Suspend Users' },
      { key: 'restore_users' as AdminPermission, label: 'Restore Suspended Users' },
    ],
  },
  {
    category: 'Learning & Content',
    permissions: [
      { key: 'view_learning_activity' as AdminPermission, label: 'View Learning Activity' },
      { key: 'view_resources' as AdminPermission, label: 'View Resources' },
      { key: 'manage_resources' as AdminPermission, label: 'Manage Resources' },
      { key: 'moderate_resources' as AdminPermission, label: 'Moderate Resources' },
    ],
  },
  {
    category: 'Analytics & Health',
    permissions: [
      { key: 'view_platform_analytics' as AdminPermission, label: 'View Platform Analytics' },
      { key: 'view_system_health' as AdminPermission, label: 'View System Health' },
      { key: 'view_audit_logs' as AdminPermission, label: 'View Audit Logs' },
    ],
  },
  {
    category: 'Settings',
    permissions: [
      { key: 'view_settings' as AdminPermission, label: 'View Platform Settings' },
      { key: 'manage_settings' as AdminPermission, label: 'Manage Platform Settings' },
    ],
  },
];

export default function AdministratorsPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();
  const { isSuperAdmin } = usePermissions();

  // Create Admin Modal State
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newPermissions, setNewPermissions] = React.useState<AdminPermission[]>([
    'view_users',
    'view_platform_analytics',
  ]);

  // Edit Permissions Modal State
  const [selectedAdmin, setSelectedAdmin] = React.useState<AdministratorDto | null>(null);
  const [editPermissionsModalOpen, setEditPermissionsModalOpen] = React.useState(false);
  const [editingPermissions, setEditingPermissions] = React.useState<AdminPermission[]>([]);

  // Status Change Modal State
  const [statusModalTarget, setStatusModalTarget] = React.useState<{ admin: AdministratorDto; nextStatus: 'ACTIVE' | 'DISABLED' } | null>(null);

  // Fetch Administrators
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-administrators-list'],
    queryFn: () => adminApi.getAdministrators(),
    enabled: isSuperAdmin,
  });

  // Create Admin Mutation
  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createAdministrator({
        email: newEmail,
        name: newName,
        password: newPassword || undefined,
        permissions: newPermissions,
      }),
    onSuccess: (res) => {
      showToast.success(res.message || 'Administrator account created.');
      setCreateModalOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewPermissions(['view_users', 'view_platform_analytics']);
      queryClient.invalidateQueries({ queryKey: ['admin-administrators-list'] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to create administrator.');
    },
  });

  // Update Permissions Mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: () =>
      adminApi.updateAdminPermissions(selectedAdmin!.id, editingPermissions),
    onSuccess: (res) => {
      showToast.success(res.message || 'Permissions updated successfully.');
      setEditPermissionsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-administrators-list'] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to update permissions.');
    },
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ adminId, status }: { adminId: string; status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED' }) =>
      adminApi.updateAdminStatus(adminId, status),
    onSuccess: (res) => {
      showToast.success(res.message || 'Administrator status updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-administrators-list'] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to change administrator status.');
    },
  });

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <ShieldAlert className="h-8 w-8 mx-auto text-state-error" />
        <h2 className="text-base font-mono font-bold text-white">403 — Super Administrator Access Required</h2>
        <p className="text-xs font-mono text-foreground-secondary">
          Only Super Administrators can create administrators or manage platform permissions.
        </p>
      </div>
    );
  }

  const openEditPermissions = (admin: AdministratorDto) => {
    setSelectedAdmin(admin);
    setEditingPermissions(admin.permissions || []);
    setEditPermissionsModalOpen(true);
  };

  const togglePermission = (
    perm: AdminPermission,
    currentList: AdminPermission[],
    setter: React.Dispatch<React.SetStateAction<AdminPermission[]>>
  ) => {
    if (currentList.includes(perm)) {
      setter(currentList.filter((p) => p !== perm));
    } else {
      setter([...currentList, perm]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-white" />
            Administrator Management
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Super Administrator oversight, role assignments, and granular permission bundles.
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
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="font-mono text-xs gap-1.5 bg-white text-black hover:bg-neutral-200"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Administrator</span>
          </Button>
        </div>
      </div>

      {/* Administrators Directory Table */}
      <Card className="border-border bg-surface shadow-md">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-mono font-semibold text-white">
                Platform Administrators
              </CardTitle>
              <CardDescription className="text-xs font-mono text-foreground-secondary">
                Registered administrators and their active permission privileges.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-neutral-700 bg-neutral-900">
              {data?.administrators?.length || 0} Total
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-surface-elevated/40 text-[11px] font-mono text-foreground-secondary uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Administrator</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Assigned Permissions</th>
                    <th className="p-3.5">Created</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs font-mono">
                  {data?.administrators.map((admin) => {
                    const isSelf = currentAdmin?.id === admin.id;
                    const isSuper = admin.role === 'SUPER_ADMIN' || admin.role === 'SUPERADMIN';

                    return (
                      <tr key={admin.id} className="hover:bg-surface-elevated/40 transition-colors">
                        {/* Admin Name & Email */}
                        <td className="p-3.5 pl-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-[11px] font-bold text-white uppercase shrink-0">
                              {admin.name ? admin.name.slice(0, 2) : admin.email.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-white flex items-center gap-1.5">
                                {admin.name || 'Admin'}
                                {isSelf && (
                                  <span className="text-[10px] text-neutral-400 font-normal">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-foreground-secondary">{admin.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono uppercase ${
                              isSuper
                                ? 'border-white text-white bg-white/10'
                                : 'border-neutral-500 text-neutral-200 bg-neutral-800'
                            }`}
                          >
                            {isSuper ? 'SUPER ADMIN' : 'ADMIN'}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono uppercase ${
                              admin.status === 'ACTIVE'
                                ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                                : admin.status === 'DISABLED'
                                ? 'border-neutral-600 text-neutral-400 bg-neutral-900'
                                : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {admin.status}
                          </Badge>
                        </td>

                        {/* Permissions Chips */}
                        <td className="p-3.5 max-w-[320px]">
                          {isSuper ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-white font-semibold">
                              <Shield className="h-3 w-3 text-white" />
                              Full Unrestricted Access
                            </span>
                          ) : admin.permissions && admin.permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {admin.permissions.slice(0, 3).map((p) => (
                                <span
                                  key={p}
                                  className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 truncate max-w-[120px]"
                                >
                                  {p}
                                </span>
                              ))}
                              {admin.permissions.length > 3 && (
                                <span className="px-1.5 py-0.5 rounded bg-neutral-900 text-[10px] text-neutral-400 border border-neutral-800">
                                  +{admin.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-500">No permissions assigned</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="p-3.5 text-foreground-secondary text-[11px]">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isSuper && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditPermissions(admin)}
                                  title="Edit Permissions"
                                  className="h-7 px-2 text-xs font-mono hover:bg-neutral-800 hover:text-white"
                                >
                                  <Key className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const nextStatus = admin.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                                    setStatusModalTarget({ admin, nextStatus });
                                  }}
                                  title={admin.status === 'ACTIVE' ? 'Disable Admin' : 'Restore Admin'}
                                  className="h-7 px-2 text-xs font-mono hover:bg-neutral-800 hover:text-amber-400"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE ADMINISTRATOR MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create New Administrator
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary">
            Set up an administrative account and configure initial permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-mono text-foreground-secondary">Full Name</label>
            <Input
              placeholder="e.g. Sarah Connor"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-surface font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-foreground-secondary">Email Address</label>
            <Input
              type="email"
              placeholder="admin.ops@devlearn.io"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-surface font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-foreground-secondary">
              Temporary Password <span className="text-foreground-muted">(Optional, defaults to generated secret)</span>
            </label>
            <Input
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-surface font-mono text-xs"
            />
          </div>

          {/* Granular Permissions Picker */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-mono font-semibold text-white">
              Assign Permissions (Least Privilege)
            </label>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {PERMISSIONS_CATEGORIES.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <span className="text-[11px] font-mono text-foreground-muted uppercase tracking-wider">
                    {cat.category}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {cat.permissions.map((p) => {
                      const isChecked = newPermissions.includes(p.key);
                      return (
                        <button
                          type="button"
                          key={p.key}
                          onClick={() => togglePermission(p.key, newPermissions, setNewPermissions)}
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
                          <span className="truncate">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateModalOpen(false)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !newEmail || !newName}
            className="font-mono text-xs bg-white text-black hover:bg-neutral-200"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Administrator'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* EDIT PERMISSIONS MODAL */}
      <Dialog open={editPermissionsModalOpen} onOpenChange={setEditPermissionsModalOpen}>
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <Key className="h-4 w-4" />
            Manage Permissions — {selectedAdmin?.name || selectedAdmin?.email}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary">
            Configure permission grants for this administrator account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {PERMISSIONS_CATEGORIES.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <span className="text-[11px] font-mono text-foreground-muted uppercase tracking-wider">
                  {cat.category}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {cat.permissions.map((p) => {
                    const isChecked = editingPermissions.includes(p.key);
                    return (
                      <button
                        type="button"
                        key={p.key}
                        onClick={() => togglePermission(p.key, editingPermissions, setEditingPermissions)}
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
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditPermissionsModalOpen(false)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => updatePermissionsMutation.mutate()}
            disabled={updatePermissionsMutation.isPending}
            className="font-mono text-xs bg-white text-black hover:bg-neutral-200"
          >
            {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* STATUS CHANGE CONFIRM MODAL */}
      <ConfirmModal
        open={Boolean(statusModalTarget)}
        onOpenChange={(open) => {
          if (!open) setStatusModalTarget(null);
        }}
        title={statusModalTarget?.nextStatus === 'ACTIVE' ? 'Restore Administrator Access' : 'Disable Administrator Access'}
        description={
          statusModalTarget?.nextStatus === 'ACTIVE'
            ? `Re-activate administrator privileges for ${statusModalTarget?.admin.email}?`
            : `Disabling ${statusModalTarget?.admin.email} will immediately terminate all active sessions and block access to the Admin Portal.`
        }
        confirmLabel={statusModalTarget?.nextStatus === 'ACTIVE' ? 'Restore Administrator' : 'Disable Administrator'}
        variant={statusModalTarget?.nextStatus === 'ACTIVE' ? 'default' : 'danger'}
        icon={statusModalTarget?.nextStatus === 'ACTIVE' ? 'info' : 'warning'}
        isLoading={toggleStatusMutation.isPending}
        onConfirm={async () => {
          if (statusModalTarget) {
            await toggleStatusMutation.mutateAsync({
              adminId: statusModalTarget.admin.id,
              status: statusModalTarget.nextStatus,
            });
            setStatusModalTarget(null);
          }
        }}
      />
    </div>
  );
}
