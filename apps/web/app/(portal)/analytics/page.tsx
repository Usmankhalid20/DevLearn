'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ContributionHeatmap } from '@/components/analytics/contribution-heatmap';
import { AnalyticsSummaryCards } from '@/components/analytics/analytics-summary-cards';
import { ActivityTrendChart } from '@/components/analytics/activity-trend-chart';
import { SubjectDistributionChart } from '@/components/analytics/subject-distribution-chart';
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
      <AnalyticsSummaryCards summary={summary} />

      {/* 52-Week Learning Calendar */}
      <ContributionHeatmap />

      {/* 2-Column Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTrendChart trendData={trendData} />
        <SubjectDistributionChart subjectData={subjectData} />
      </div>
    </div>
  );
}
