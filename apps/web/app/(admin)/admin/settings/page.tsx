'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { showToast } from '@/lib/toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Save,
  AlertTriangle,
  Radio,
  UserCheck,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { can, isSuperAdmin } = usePermissions();

  const [allowRegistrations, setAllowRegistrations] = React.useState(true);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [dailyGoalMinutes, setDailyGoalMinutes] = React.useState(60);
  const [broadcastMessage, setBroadcastMessage] = React.useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => adminApi.getPlatformSettings(),
    enabled: can('view_settings'),
  });

  React.useEffect(() => {
    if (data) {
      setAllowRegistrations(data.allowNewRegistrations);
      setMaintenanceMode(data.maintenanceMode);
      setDailyGoalMinutes(data.defaultDailyGoalMinutes);
      setBroadcastMessage(data.systemNotification || '');
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updatePlatformSettings({
        allowNewRegistrations: allowRegistrations,
        maintenanceMode,
        defaultDailyGoalMinutes: Number(dailyGoalMinutes),
        systemNotification: broadcastMessage || null,
      }),
    onSuccess: (res) => {
      showToast.success(res.message || 'Platform settings saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to update platform settings.');
    },
  });

  if (!can('view_settings')) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <ShieldAlert className="h-8 w-8 mx-auto text-state-error" />
        <h2 className="text-base font-mono font-bold text-white">403 — Access Forbidden</h2>
        <p className="text-xs font-mono text-foreground-secondary">
          Permission [view_settings] is required to access platform settings.
        </p>
      </div>
    );
  }

  const canManage = isSuperAdmin || can('manage_settings');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-white" />
            Platform Settings
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Global operational controls, maintenance modes, and registration policies.
          </p>
        </div>

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
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center text-xs font-mono text-state-error">
          Failed to load platform operational settings.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {/* Registration & Access Control */}
          <Card className="border-border bg-surface shadow-md">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-mono font-semibold text-white flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-foreground-muted" />
                Access &amp; User Enrollment
              </CardTitle>
              <CardDescription className="text-xs font-mono text-foreground-secondary">
                Control whether new users are allowed to self-register.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/40 border border-border">
                <div>
                  <p className="font-semibold text-white font-mono text-xs">Allow New Registrations</p>
                  <p className="text-[11px] font-mono text-foreground-secondary">
                    When disabled, the `/register` endpoint rejects new signups.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowRegistrations}
                  disabled={!canManage}
                  onChange={(e) => setAllowRegistrations(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-base text-white focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-foreground-secondary">
                  Default Daily Learning Goal (Minutes)
                </label>
                <Input
                  type="number"
                  min="10"
                  max="480"
                  value={dailyGoalMinutes}
                  disabled={!canManage}
                  onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value, 10) || 60)}
                  className="bg-surface-elevated font-mono text-xs max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance & Broadcasts */}
          <Card className="border-border bg-surface shadow-md">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-mono font-semibold text-white flex items-center gap-2">
                <Radio className="h-4 w-4 text-foreground-muted" />
                Maintenance &amp; Broadcast Announcement
              </CardTitle>
              <CardDescription className="text-xs font-mono text-foreground-secondary">
                Display system-wide notices or put the platform into maintenance mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-state-error/5 border border-state-error/20">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-state-error shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white font-mono text-xs">Platform Maintenance Mode</p>
                    <p className="text-[11px] font-mono text-foreground-secondary">
                      When enabled, learners will see a scheduled maintenance notice.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  disabled={!canManage}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-base text-white focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-foreground-secondary">
                  Global System Broadcast Banner (Markdown / Plaintext)
                </label>
                <Textarea
                  placeholder="e.g. Scheduled database maintenance tonight at 02:00 UTC."
                  value={broadcastMessage}
                  disabled={!canManage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="bg-surface-elevated font-mono text-xs min-h-[80px]"
                />
              </div>
            </CardContent>

            {canManage && (
              <CardFooter className="pt-3 border-t border-border/60 flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="font-mono text-xs gap-1.5 bg-white text-black hover:bg-neutral-200"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{updateMutation.isPending ? 'Saving Settings...' : 'Save Changes'}</span>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
