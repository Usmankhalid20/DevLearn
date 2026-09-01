'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Clock,
  Flame,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  RefreshCw,
  Loader2,
  Layers,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminOverviewPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: adminApi.getOverview,
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-foreground-secondary" />
          <p className="text-xs font-mono text-foreground-secondary">
            Loading platform telemetry & metrics...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <p className="text-sm font-mono text-state-error">
          Failed to load administrative overview metrics.
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

  const { metrics, growth, popularSubjects } = data;

  const kpis = [
    {
      label: 'Total Registered Users',
      value: metrics.totalUsers.toLocaleString(),
      subtext: `${metrics.activeUsersLast30Days} active in last 30d`,
      icon: Users,
    },
    {
      label: 'Total Study Volume',
      value: `${metrics.totalLearningHours.toLocaleString()} hrs`,
      subtext: `${metrics.totalSessionsLogged.toLocaleString()} logged sessions`,
      icon: Clock,
    },
    {
      label: 'Active Daily Streaks',
      value: metrics.activeStreaksCount.toLocaleString(),
      subtext: 'Learners with ongoing consistency',
      icon: Flame,
    },
    {
      label: 'Completed Tasks',
      value: metrics.totalTasksCompleted.toLocaleString(),
      subtext: 'Learning milestones accomplished',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white">
            Platform Analytics & Growth
          </h1>
          <p className="text-xs font-mono text-foreground-secondary">
            Live aggregated metrics across all registered DevLearn learner accounts
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="font-mono text-xs gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? 'Syncing...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border bg-surface">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground-secondary">
                    {kpi.label}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-surface-elevated text-neutral-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono tracking-tight text-white">
                  {kpi.value}
                </div>
                <p className="text-[11px] font-mono text-neutral-500">
                  {kpi.subtext}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Growth Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Signups (30 Days) */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white" />
                User Signups (Last 30 Days)
              </CardTitle>
              <span className="text-[11px] font-mono text-foreground-secondary">
                Daily New Registrations
              </span>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Accounts created each calendar day
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growth.userSignupsPast30Days}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#737373"
                    fontSize={10}
                    tickFormatter={(val) => val.slice(5)}
                    fontFamily="monospace"
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={10}
                    allowDecimals={false}
                    fontFamily="monospace"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderColor: '#404040',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#ffffff',
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Signups"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Study Volume (30 Days) */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-white" />
                Study Volume (Last 30 Days)
              </CardTitle>
              <span className="text-[11px] font-mono text-foreground-secondary">
                Daily Minutes
              </span>
            </div>
            <CardDescription className="text-xs text-foreground-secondary">
              Total learning minutes logged across all active learners
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={growth.studyMinutesPast30Days}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#737373"
                    fontSize={10}
                    tickFormatter={(val) => val.slice(5)}
                    fontFamily="monospace"
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={10}
                    fontFamily="monospace"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderColor: '#404040',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#ffffff',
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(val: any) => [`${val} mins (${(val / 60).toFixed(1)} hrs)`, 'Study Time']}
                  />
                  <Bar
                    dataKey="totalMinutes"
                    name="Minutes"
                    fill="#a3a3a3"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Subjects Breakdown */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-white" />
            Top Learning Subjects & Disciplines
          </CardTitle>
          <CardDescription className="text-xs text-foreground-secondary">
            Most studied topics ranked by cumulative learning duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {popularSubjects.length === 0 ? (
            <p className="text-xs font-mono text-neutral-500 py-4 text-center">
              No learning subjects recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {popularSubjects.map((sub, index) => {
                const hours = (sub.totalMinutes / 60).toFixed(1);
                const maxMinutes = popularSubjects[0]?.totalMinutes || 1;
                const percentage = Math.round((sub.totalMinutes / maxMinutes) * 100);

                return (
                  <div key={sub.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 w-4">{index + 1}.</span>
                        <span className="font-semibold text-white">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-foreground-secondary">
                        <span>{sub.userCount} {sub.userCount === 1 ? 'learner' : 'learners'}</span>
                        <span className="text-white font-medium">{hours} hrs</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
