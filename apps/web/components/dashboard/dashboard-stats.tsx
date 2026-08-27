import * as React from 'react';
import { Clock, Flame, CheckCircle2, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsProps {
  todayMinutes: number;
  dailyGoal: number;
  goalProgress: number;
  currentStreak: number;
  totalHours: string | number;
  totalSessionsCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export function DashboardStats({
  todayMinutes,
  dailyGoal,
  goalProgress,
  currentStreak,
  totalHours,
  totalSessionsCount,
  completedTasksCount,
  totalTasksCount,
}: DashboardStatsProps) {
  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Learning */}
      <Card className="bg-surface border-border">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
            <span>Today&apos;s Focus</span>
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatMinutes(todayMinutes)}
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-foreground-muted">
              <span>Goal: {formatMinutes(dailyGoal)}</span>
              <span>{goalProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-background overflow-hidden border border-border">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${Math.min(100, goalProgress)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-surface border-border">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
            <span>Current Streak</span>
            <Flame className="h-4 w-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
          </div>
          <p className="text-[11px] font-mono text-foreground-secondary pt-1">
            {currentStreak > 0 ? 'Consistent momentum' : 'Log a session to begin'}
          </p>
        </CardContent>
      </Card>

      {/* Total All-Time Time */}
      <Card className="bg-surface border-border">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
            <span>Total Study Time</span>
            <Target className="h-4 w-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalHours}h</div>
          <p className="text-[11px] font-mono text-foreground-secondary pt-1">
            Across {totalSessionsCount} recorded sessions
          </p>
        </CardContent>
      </Card>

      {/* Tasks Completed */}
      <Card className="bg-surface border-border">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
            <span>Tasks Finished</span>
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {completedTasksCount} / {totalTasksCount}
          </div>
          <p className="text-[11px] font-mono text-foreground-secondary pt-1">
            {totalTasksCount - completedTasksCount} pending objectives
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
