'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Flame,
  Clock,
  Calendar,
  Layers,
  Award,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContributionHeatmap } from '@/components/analytics/contribution-heatmap';
import { analyticsApi } from '@/lib/analytics-api';

export default function AnalyticsPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsApi.getSummary,
  });

  if (isLoading || !summary) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  // Format 30-day trend data for Recharts
  const trendData = summary.dailyActivityTrend.map((d) => ({
    date: d.date.slice(5), // MM-DD
    minutes: d.minutes,
  }));

  // Format subject distribution data
  const subjectData = summary.subjectDistribution.map((s) => ({
    name: s.subjectName,
    minutes: s.totalMinutes,
    percentage: s.percentage,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
          Analytics &amp; Performance
        </h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Deep-dive analysis of your learning metrics, streaks, and subject distribution.
        </p>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Total Learning</span>
              <Clock className="h-4 w-4 text-foreground-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">{summary.totalHours}h</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              Across {summary.totalSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Current Streak</span>
              <Flame className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">{summary.currentStreak} days</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              {summary.currentStreak > 0 ? 'Consistent progress' : 'Log today to start'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Best Streak</span>
              <Award className="h-4 w-4 text-foreground-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">{summary.longestStreak} days</div>
            <p className="text-[11px] text-foreground-secondary mt-1">All-time maximum</p>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Avg. Session</span>
              <Calendar className="h-4 w-4 text-foreground-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">
              {summary.averageSessionMinutes}m
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">Per recorded session</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Calendar Heatmap */}
      <ContributionHeatmap />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Activity Trend */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-foreground-secondary" />
              Last 30 Days Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Daily minutes tracked over the last 30 calendar days
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis
                    dataKey="date"
                    stroke="#555555"
                    fontSize={10}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis stroke="#555555" fontSize={10} tickLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151515',
                      borderColor: '#2A2A2A',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#ffffff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#ffffff"
                    fill="#303030"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Breakdown Chart */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-foreground-secondary" />
              Time by Subject
            </CardTitle>
            <CardDescription className="text-xs">
              Total minutes dedicated to each learning subject
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {subjectData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-xs text-foreground-muted font-mono">
                No subject data available yet.
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <XAxis type="number" stroke="#555555" fontSize={10} tickLine={false} unit="m" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#858585"
                      fontSize={11}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151515',
                        borderColor: '#2A2A2A',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                      formatter={(val: any) => [`${val} minutes`, 'Duration']}
                    />
                    <Bar dataKey="minutes" fill="#858585" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
