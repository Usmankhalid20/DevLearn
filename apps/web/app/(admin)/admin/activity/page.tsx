'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type LearningActivityQueryParams } from '@/lib/admin-api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  BookOpen,
  User,
  Calendar,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export default function AdminActivityPage() {
  const { can } = usePermissions();
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-learning-activity', page],
    queryFn: () => adminApi.getLearningActivities({ page, limit }),
    enabled: can('view_learning_activity'),
  });

  if (!can('view_learning_activity')) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <ShieldAlert className="h-8 w-8 mx-auto text-state-error" />
        <h2 className="text-base font-mono font-bold text-white">403 — Access Forbidden</h2>
        <p className="text-xs font-mono text-foreground-secondary">
          Permission [view_learning_activity] is required to inspect platform learning activity.
        </p>
      </div>
    );
  }

  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-white" />
            Platform Learning Activity
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Aggregated learning session telemetry across all registered learners.
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

      {/* Activity Table */}
      <Card className="border-border bg-surface shadow-md">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-mono font-semibold text-white">
                Recent Learning Sessions
              </CardTitle>
              <CardDescription className="text-xs font-mono text-foreground-secondary">
                Displaying high-level session durations and subjects respecting privacy boundaries.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-neutral-700 bg-neutral-900">
              {pagination?.totalCount || 0} Total Sessions
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
              Failed to load learning activity records.
            </div>
          ) : (data?.activities || []).length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-foreground-secondary">
              No learning sessions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-surface-elevated/40 text-[11px] font-mono text-foreground-secondary uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Learner</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Session Date</th>
                    <th className="p-3.5 pr-4">Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs font-mono">
                  {data?.activities.map((act) => (
                    <tr key={act.id} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-white uppercase shrink-0">
                            {act.userName ? act.userName.slice(0, 2) : act.userEmail.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-white truncate max-w-[180px]">
                              {act.userName || act.userEmail.split('@')[0]}
                            </p>
                            <p className="text-[10px] text-foreground-secondary truncate max-w-[180px]">
                              {act.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-elevated border border-border text-neutral-200">
                          <BookOpen className="h-3 w-3 text-foreground-muted" />
                          <span className="truncate max-w-[160px]">{act.subjectName}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-white">
                          {act.durationMinutes} min
                        </span>
                        <span className="text-[11px] text-foreground-muted ml-1">
                          ({(act.durationMinutes / 60).toFixed(1)} hrs)
                        </span>
                      </td>

                      <td className="p-3.5 text-neutral-300">
                        {new Date(act.date).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 pr-4 text-foreground-secondary text-[11px]">
                        {new Date(act.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-3.5 border-t border-border/80 text-xs font-mono">
              <span className="text-foreground-secondary">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
