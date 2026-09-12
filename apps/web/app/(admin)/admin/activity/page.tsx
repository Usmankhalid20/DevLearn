'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Download,
  Search,
  X,
  Filter,
  BarChart2,
  Flame,
  Users,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export default function AdminActivityPage() {
  const { can } = usePermissions();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [durationFilter, setDurationFilter] = React.useState<'all' | 'quick' | 'standard' | 'deep'>('all');
  const limit = 20;

  // Debounce search query to avoid spamming the backend
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-learning-activity', page, debouncedSearch],
    queryFn: () => adminApi.getLearningActivities({ page, limit, search: debouncedSearch.trim() || undefined }),
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
  const rawActivities = data?.activities || [];

  // Telemetry metrics calculation
  const totalMinutes = rawActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgDuration = rawActivities.length ? Math.round(totalMinutes / rawActivities.length) : 0;
  const uniqueLearners = new Set(rawActivities.map((a) => a.userId || a.userEmail)).size;

  // Filter activities by duration
  const filteredActivities = rawActivities.filter((act) => {
    if (durationFilter === 'quick') return act.durationMinutes < 30;
    if (durationFilter === 'standard') return act.durationMinutes >= 30 && act.durationMinutes <= 60;
    if (durationFilter === 'deep') return act.durationMinutes > 60;
    return true;
  });

  // Export filtered learning activity to CSV
  const handleExportCsv = () => {
    if (filteredActivities.length === 0) return;

    const headers = ['Learner Name', 'Learner Email', 'Subject', 'Duration (Minutes)', 'Duration (Hours)', 'Session Date', 'Logged At'];
    const rows = filteredActivities.map((act) => [
      `"${(act.userName || 'Unknown').replace(/"/g, '""')}"`,
      `"${act.userEmail.replace(/"/g, '""')}"`,
      `"${act.subjectName.replace(/"/g, '""')}"`,
      act.durationMinutes,
      (act.durationMinutes / 60).toFixed(2),
      `"${new Date(act.date).toLocaleDateString()}"`,
      `"${new Date(act.createdAt).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `devlearn-learning-activity-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDurationFilter('all');
    setPage(1);
  };

  const isFiltered = search.trim().length > 0 || durationFilter !== 'all';

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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredActivities.length === 0}
            className="font-mono text-xs gap-1.5 border-neutral-700 hover:bg-neutral-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

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
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-foreground-secondary">Total Sessions</p>
              <p className="text-2xl font-bold font-mono text-white">{pagination?.totalCount ?? 0}</p>
              <p className="text-[10px] font-mono text-foreground-muted">Platform-wide records</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-white">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-foreground-secondary">Focus Hours</p>
              <p className="text-2xl font-bold font-mono text-white">{totalHours}h</p>
              <p className="text-[10px] font-mono text-foreground-muted">{totalMinutes} focus mins (page)</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-white">
              <BarChart2 className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-foreground-secondary">Avg Session</p>
              <p className="text-2xl font-bold font-mono text-white">{avgDuration}m</p>
              <p className="text-[10px] font-mono text-foreground-muted">Mean focus duration</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-white">
              <Flame className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-foreground-secondary">Active Learners</p>
              <p className="text-2xl font-bold font-mono text-white">{uniqueLearners}</p>
              <p className="text-[10px] font-mono text-foreground-muted">In current page view</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-white">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Table & Filter Controls */}
      <Card className="border-border bg-surface shadow-md">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-mono font-semibold text-white">
                Recent Learning Sessions
              </CardTitle>
              <CardDescription className="text-xs font-mono text-foreground-secondary">
                Displaying high-level session durations and subjects respecting privacy boundaries.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-neutral-700 bg-neutral-900 w-fit">
              {filteredActivities.length} Visible / {pagination?.totalCount || 0} Total
            </Badge>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Search by learner name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8 font-mono text-xs h-9 bg-neutral-900 border-neutral-800"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-foreground-muted hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Duration Filters */}
            <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-md border border-neutral-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDurationFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                  durationFilter === 'all'
                    ? 'bg-neutral-700 text-white font-semibold'
                    : 'text-foreground-secondary hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter('quick')}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                  durationFilter === 'quick'
                    ? 'bg-neutral-700 text-white font-semibold'
                    : 'text-foreground-secondary hover:text-white'
                }`}
              >
                &lt; 30m
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter('standard')}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                  durationFilter === 'standard'
                    ? 'bg-neutral-700 text-white font-semibold'
                    : 'text-foreground-secondary hover:text-white'
                }`}
              >
                30–60m
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter('deep')}
                className={`px-2.5 py-1 rounded transition-colors text-[11px] ${
                  durationFilter === 'deep'
                    ? 'bg-neutral-700 text-white font-semibold'
                    : 'text-foreground-secondary hover:text-white'
                }`}
              >
                &gt; 60m
              </button>
            </div>

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="font-mono text-xs text-foreground-secondary hover:text-white h-9 px-2"
              >
                Reset
              </Button>
            )}
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
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center space-y-3 font-mono">
              <Filter className="h-8 w-8 mx-auto text-foreground-muted" />
              <p className="text-xs text-white font-semibold">No matching learning sessions found</p>
              <p className="text-[11px] text-foreground-secondary">
                {isFiltered
                  ? 'Try adjusting your search query or duration filters.'
                  : 'No learning sessions recorded yet.'}
              </p>
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="font-mono text-xs mt-2"
                >
                  Clear Filters
                </Button>
              )}
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
                  {filteredActivities.map((act) => (
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
