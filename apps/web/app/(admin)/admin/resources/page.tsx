'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type ResourcesQueryParams } from '@/lib/admin-api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Search,
  ExternalLink,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Bookmark,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export default function AdminResourcesPage() {
  const { can } = usePermissions();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-resources', page, search],
    queryFn: () => adminApi.getResources({ page, limit, search: search || undefined }),
    enabled: can('view_resources'),
  });

  if (!can('view_resources')) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <ShieldAlert className="h-8 w-8 mx-auto text-state-error" />
        <h2 className="text-base font-mono font-bold text-white">403 — Access Forbidden</h2>
        <p className="text-xs font-mono text-foreground-secondary">
          Permission [view_resources] is required to access the platform resources catalog.
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
            <Bookmark className="h-5 w-5 text-white" />
            Platform Learning Resources
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Curriculum bookmarks, documentation references, and resource link health.
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

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
          <Input
            placeholder="Search resource title or URL..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-surface font-mono text-xs"
          />
        </div>
      </div>

      {/* Resources Table */}
      <Card className="border-border bg-surface shadow-md">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono font-semibold text-white">
              Indexed Learning Resources
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs border-neutral-700 bg-neutral-900">
              {pagination?.totalCount || 0} Total
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
              Failed to load resources catalog.
            </div>
          ) : (data?.resources || []).length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-foreground-secondary">
              No learning resources found matching filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-surface-elevated/40 text-[11px] font-mono text-foreground-secondary uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Resource Title</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Owner</th>
                    <th className="p-3.5">Added</th>
                    <th className="p-3.5 pr-4 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs font-mono">
                  {data?.resources.map((res) => (
                    <tr key={res.id} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-3.5 pl-4 max-w-[280px]">
                        <p className="font-semibold text-white truncate">{res.title}</p>
                        <p className="text-[11px] text-foreground-muted truncate">{res.url}</p>
                      </td>

                      <td className="p-3.5">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 uppercase">
                          {res.type || 'LINK'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-neutral-300 truncate max-w-[150px] inline-block">
                          {res.subjectName || 'General'}
                        </span>
                      </td>

                      <td className="p-3.5 text-foreground-secondary text-[11px] truncate max-w-[150px]">
                        {res.userEmail}
                      </td>

                      <td className="p-3.5 text-foreground-secondary text-[11px]">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-foreground-secondary hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
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
