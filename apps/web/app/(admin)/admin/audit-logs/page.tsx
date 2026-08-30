'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type AuditLogsQueryParams } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
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
import {
  ScrollText,
  Shield,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Code,
  Calendar,
  User,
} from 'lucide-react';
import type { AuditLogItemDto } from '@devlearn/types';

export default function AdminAuditLogsPage() {
  const [queryParams, setQueryParams] = React.useState<AuditLogsQueryParams>({
    page: 1,
    limit: 20,
  });

  const [selectedLog, setSelectedLog] = React.useState<AuditLogItemDto | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'audit-logs', queryParams],
    queryFn: () => adminApi.getAuditLogs(queryParams),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white">
            Security & Administration Audit Trail
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Immutable log of role promotions, moderation actions, session terminations, and account alterations
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border bg-surface">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-foreground-secondary">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter by Action:</span>
            </div>

            <div className="w-full sm:w-64">
              <Select
                value={queryParams.action || ''}
                onChange={(e) =>
                  setQueryParams((prev) => ({
                    ...prev,
                    action: e.target.value || undefined,
                    page: 1,
                  }))
                }
                className="h-9 font-mono text-xs bg-base border-border"
              >
                <option value="">All Actions</option>
                <option value="USER_ROLE_UPDATED">USER_ROLE_UPDATED</option>
                <option value="USER_STATUS_UPDATED">USER_STATUS_UPDATED</option>
                <option value="USER_SUSPENDED">USER_SUSPENDED</option>
                <option value="USER_RESTORED">USER_RESTORED</option>
                <option value="USER_SESSIONS_REVOKED">USER_SESSIONS_REVOKED</option>
                <option value="USER_DELETED">USER_DELETED</option>
                <option value="VERIFICATION_OVERRIDDEN">VERIFICATION_OVERRIDDEN</option>
                <option value="ADMIN_CREATED">ADMIN_CREATED</option>
                <option value="ADMIN_PERMISSIONS_UPDATED">ADMIN_PERMISSIONS_UPDATED</option>
                <option value="ADMIN_DISABLED">ADMIN_DISABLED</option>
                <option value="ADMIN_RESTORED">ADMIN_RESTORED</option>
                <option value="CACHE_PURGED">CACHE_PURGED</option>
                <option value="PLATFORM_SETTINGS_CHANGED">PLATFORM_SETTINGS_CHANGED</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-border bg-surface-elevated text-foreground-secondary">
              <tr>
                <th className="p-3.5 pl-4 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">Action</th>
                <th className="p-3.5 font-semibold">Admin (Actor)</th>
                <th className="p-3.5 font-semibold">Target User</th>
                <th className="p-3.5 font-semibold">IP Address</th>
                <th className="p-3.5 pr-4 text-right font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-foreground-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                      <span>Loading audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : !data || data.logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-foreground-secondary">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated/40 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3.5 pl-4 text-foreground-secondary whitespace-nowrap">
                      {log.createdAt.replace('T', ' ').slice(0, 19)}
                    </td>

                    {/* Action */}
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono ${
                          log.action.includes('DELETED')
                            ? 'border-state-error/50 text-state-error bg-state-error/10'
                            : log.action.includes('ROLE')
                            ? 'border-white text-white bg-white/10'
                            : 'border-border text-foreground-secondary'
                        }`}
                      >
                        {log.action}
                      </Badge>
                    </td>

                    {/* Actor */}
                    <td className="p-3.5">
                      <div className="font-semibold text-white truncate max-w-[150px]">
                        {log.actor.name || log.actor.email}
                      </div>
                      <div className="text-[10px] text-foreground-secondary truncate max-w-[150px]">
                        {log.actor.email}
                      </div>
                    </td>

                    {/* Target */}
                    <td className="p-3.5">
                      {log.target ? (
                        <>
                          <div className="font-semibold text-white truncate max-w-[150px]">
                            {log.target.name || log.target.email}
                          </div>
                          <div className="text-[10px] text-foreground-secondary truncate max-w-[150px]">
                            {log.target.email}
                          </div>
                        </>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>

                    {/* IP */}
                    <td className="p-3.5 text-foreground-secondary text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    {/* Metadata Inspector Button */}
                    <td className="p-3.5 pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-7 px-2 text-xs font-mono hover:bg-neutral-800 hover:text-white gap-1"
                      >
                        <Code className="h-3 w-3" />
                        <span>JSON</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-3.5 px-4 bg-surface text-xs font-mono">
            <span className="text-foreground-secondary">
              Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalCount} total audit logs)
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

      {/* JSON Metadata Viewer Dialog */}
      <Dialog
        open={Boolean(selectedLog)}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm font-bold text-white flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Audit Log Metadata Details
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-foreground-secondary">
            Action: <span className="text-white font-semibold">{selectedLog?.action}</span> • ID: {selectedLog?.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <pre className="p-3 rounded-lg bg-base border border-border text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-80">
            {JSON.stringify(
              {
                action: selectedLog?.action,
                actor: selectedLog?.actor,
                target: selectedLog?.target,
                ipAddress: selectedLog?.ipAddress,
                userAgent: selectedLog?.userAgent,
                metadata: selectedLog?.metadata,
                timestamp: selectedLog?.createdAt,
              },
              null,
              2
            )}
          </pre>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedLog(null)}
            className="font-mono text-xs"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
