import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Flame, Calendar, Layers } from 'lucide-react';
import type { AnalyticsSummary } from '@/lib/analytics-api';

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Learning */}
      <Card className="bg-surface border-border">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground-muted uppercase">Total Learning</span>
            <Clock className="h-4 w-4 text-foreground-secondary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold font-mono text-white">{summary.totalHours}h</div>
          <p className="text-[11px] font-mono text-foreground-secondary mt-1">
            Across {summary.totalSessions} sessions
          </p>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-surface border-border">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground-muted uppercase">Current Streak</span>
            <Flame className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold font-mono text-white">{summary.currentStreak} days</div>
          <p className="text-[11px] font-mono text-foreground-secondary mt-1">
            Longest streak: {summary.longestStreak} days
          </p>
        </CardContent>
      </Card>

      {/* Average Session */}
      <Card className="bg-surface border-border">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground-muted uppercase">Avg Session</span>
            <Calendar className="h-4 w-4 text-foreground-secondary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold font-mono text-white">{summary.averageSessionMinutes}m</div>
          <p className="text-[11px] font-mono text-foreground-secondary mt-1">
            Average focus duration
          </p>
        </CardContent>
      </Card>

      {/* Active Subjects */}
      <Card className="bg-surface border-border">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground-muted uppercase">Tracked Skills</span>
            <Layers className="h-4 w-4 text-foreground-secondary" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold font-mono text-white">
            {summary.subjectDistribution.length}
          </div>
          <p className="text-[11px] font-mono text-foreground-secondary mt-1">
            Active distinct subjects
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
