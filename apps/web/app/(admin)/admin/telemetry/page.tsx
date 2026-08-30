'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { showToast } from '@/lib/toast';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Database,
  Server,
  Cpu,
  RefreshCw,
  Loader2,
  HardDrive,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Trash2,
  Flame,
} from 'lucide-react';

export default function AdminTelemetryPage() {
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [purgeModalOpen, setPurgeModalOpen] = React.useState(false);
  const { isSuperAdmin } = usePermissions();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'telemetry'],
    queryFn: adminApi.getTelemetry,
    refetchInterval: autoRefresh ? 10000 : false, // 10s live polling
  });

  const purgeMutation = useMutation({
    mutationFn: () => adminApi.purgeCache(),
    onSuccess: (res) => {
      showToast.success(res.message || 'Redis cache flushed successfully.');
      refetch();
    },
    onError: (err: any) => {
      showToast.error(err?.message || 'Failed to flush cache.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
          <p className="text-xs font-mono text-foreground-secondary">
            Querying live infrastructure probes...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <p className="text-sm font-mono text-state-error">
          Failed to fetch infrastructure telemetry.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="font-mono text-xs"
        >
          Retry
        </Button>
      </div>
    );
  }

  const { status, timestamp, uptimeSeconds, system, database, redis } = data;

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  const heapPercentage = Math.round(
    (system.memoryUsageMb.heapUsed / system.memoryUsageMb.heapTotal) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white">
              System Telemetry & Health
            </h1>
            <Badge
              variant="outline"
              className={`font-mono text-[10px] uppercase ${
                status === 'HEALTHY'
                  ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                  : 'border-amber-500/50 text-amber-400 bg-amber-500/10'
              }`}
            >
              {status}
            </Badge>
          </div>
          <p className="text-xs font-mono text-foreground-secondary mt-0.5">
            Live diagnostic telemetry measuring database, cache, runtime memory, and uptime
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`font-mono text-xs ${autoRefresh ? 'text-white border-neutral-700 bg-surface-elevated' : 'text-foreground-secondary'}`}
          >
            Live 10s Polling: {autoRefresh ? 'ON' : 'OFF'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="font-mono text-xs gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Probing...' : 'Probe Now'}</span>
          </Button>
        </div>
      </div>

      {/* Infrastructure Core Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Node.js Server Runtime */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-white" />
                Node.js Backend Process
              </CardTitle>
              <Badge variant="outline" className="border-border text-[10px] font-mono text-neutral-300">
                {system.nodeVersion}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Host Platform:</span>
              <span className="text-white capitalize">{system.platform}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Process Uptime:</span>
              <span className="text-white">{formatUptime(uptimeSeconds)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Last Telemetry Probe:</span>
              <span className="text-white">{timestamp.slice(11, 19)} UTC</span>
            </div>
          </CardContent>
        </Card>

        {/* PostgreSQL Database */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-white" />
                PostgreSQL Primary DB
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono ${
                  database.status === 'CONNECTED'
                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                    : 'border-state-error/50 text-state-error bg-state-error/10'
                }`}
              >
                {database.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Query Ping Latency:</span>
              <span className="text-white font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3 text-white" />
                {database.latencyMs} ms
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">ORM Engine:</span>
              <span className="text-white">Prisma Client 6.x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Connection Health:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Operational
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Redis In-Memory Cache */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-white" />
                Redis Cache & Rate Limiting
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono ${
                  redis.status === 'CONNECTED'
                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                    : 'border-state-error/50 text-state-error bg-state-error/10'
                }`}
              >
                {redis.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Ping Roundtrip:</span>
              <span className="text-white font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3 text-white" />
                {redis.latencyMs} ms
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Used Cache Memory:</span>
              <span className="text-white">{redis.usedMemoryKb || 0} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Cache Status:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Operational
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Footprint Panel */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-white" />
            V8 Heap & Memory Allocation
          </CardTitle>
          <CardDescription className="text-xs text-foreground-secondary">
            Process memory footprint in Megabytes (MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-1">
              <span className="text-xs text-foreground-secondary">Resident Set Size (RSS)</span>
              <div className="text-lg font-bold text-white">{system.memoryUsageMb.rss} MB</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-1">
              <span className="text-xs text-foreground-secondary">Heap Total</span>
              <div className="text-lg font-bold text-white">{system.memoryUsageMb.heapTotal} MB</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-1">
              <span className="text-xs text-foreground-secondary">Heap Used</span>
              <div className="text-lg font-bold text-white">{system.memoryUsageMb.heapUsed} MB</div>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-foreground-secondary">
              <span>Heap Utilization ({heapPercentage}%)</span>
              <span>{system.memoryUsageMb.heapUsed} / {system.memoryUsageMb.heapTotal} MB</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${Math.min(100, heapPercentage)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redis Cache Flush & Maintenance Operations */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-white" />
                Cache Operations &amp; Invalidation
              </CardTitle>
              <CardDescription className="text-xs text-foreground-secondary">
                Evict application cache keys and flush Redis in-memory storage on demand.
              </CardDescription>
            </div>
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPurgeModalOpen(true)}
                disabled={purgeMutation.isPending}
                className="font-mono text-xs gap-1.5 border-neutral-700 hover:bg-neutral-800 hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{purgeMutation.isPending ? 'Flushing Cache...' : 'Flush Cache Keys'}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="font-mono text-xs text-foreground-secondary">
          <p>
            Flushing the Redis cache forces recomputation of platform overview statistics, leaderboard rankings, and active query digests. This administrative operation is recorded in the immutable audit log as <code className="px-1 py-0.5 rounded bg-neutral-800 text-white font-mono text-[11px]">CACHE_PURGED</code>.
          </p>
        </CardContent>
      </Card>

      {/* FLUSH CACHE CONFIRM MODAL */}
      <ConfirmModal
        open={purgeModalOpen}
        onOpenChange={setPurgeModalOpen}
        title="Flush Redis In-Memory Cache"
        description="Are you sure you want to flush all Redis cache keys? Active analytics digests, leaderboards, and query caches will be immediately invalidated and recomputed."
        confirmLabel="Flush Cache Keys"
        variant="danger"
        icon="warning"
        isLoading={purgeMutation.isPending}
        onConfirm={async () => {
          setPurgeModalOpen(false);
          await purgeMutation.mutateAsync();
        }}
      />
    </div>
  );
}
