'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContributionHeatmap } from '@/components/analytics/contribution-heatmap';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardRecentSessions } from '@/components/dashboard/dashboard-recent-sessions';
import { DashboardQuickTasks } from '@/components/dashboard/dashboard-quick-tasks';
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions';
import { SessionDialog } from '@/components/learning/session-dialog';
import { TaskDialog } from '@/components/learning/task-dialog';
import { learningApi } from '@/lib/learning-api';
import { analyticsApi } from '@/lib/analytics-api';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, settings, isLoading: authLoading, isAuthenticated } = useAuth();

  const [sessionDialogOpen, setSessionDialogOpen] = React.useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch real analytics summary
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsApi.getSummary,
    enabled: isAuthenticated,
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: learningApi.getSubjects,
    enabled: isAuthenticated,
  });

  // Fetch recent sessions
  const { data: recentSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['learning-sessions', 'recent'],
    queryFn: () => learningApi.getSessions({ limit: 10 }),
    enabled: isAuthenticated,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => learningApi.getTasks(),
    enabled: isAuthenticated,
  });

  if (authLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  // Calculate live today metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = recentSessions.filter((s) => s.date.slice(0, 10) === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const dailyGoal = settings?.dailyGoalMinutes || 60;
  const goalProgress = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));

  const totalHours = summary?.totalHours ?? '0.0';
  const totalSessionsCount = summary?.totalSessions ?? recentSessions.length;
  const currentStreak = summary?.currentStreak ?? 0;
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const handleToggleTask = async (id: string) => {
    await learningApi.toggleTask(id);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['learning-sessions'] });
    queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
    queryClient.invalidateQueries({ queryKey: ['contribution-calendar'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
  };

  return (
    <div className="space-y-8">
      {/* Verification Notice */}
      {!user.isEmailVerified && (
        <div className="flex items-center justify-between rounded-lg border border-state-warning/30 bg-surface p-4 text-xs">
          <div className="flex items-center gap-2 text-foreground-secondary">
            <AlertCircle className="h-4 w-4 text-state-warning shrink-0" />
            <span>
              Please verify your email address (<strong>{user.email}</strong>) to secure your account.
            </span>
          </div>
          <Badge variant="warning" className="text-[10px]">
            Unverified
          </Badge>
        </div>
      )}

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Welcome back, {user.name || user.email.split('@')[0]}
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Here is your daily study overview, active streak, and recent learning activity.
          </p>
        </div>

        <DashboardQuickActions
          onOpenSessionDialog={() => setSessionDialogOpen(true)}
          onOpenTaskDialog={() => setTaskDialogOpen(true)}
        />
      </div>

      {/* Primary Key Stats Cards */}
      <DashboardStats
        todayMinutes={todayMinutes}
        dailyGoal={dailyGoal}
        goalProgress={goalProgress}
        currentStreak={currentStreak}
        totalHours={totalHours}
        totalSessionsCount={totalSessionsCount}
        completedTasksCount={completedTasks.length}
        totalTasksCount={tasks.length}
      />

      {/* 52-Week Learning Heatmap */}
      <ContributionHeatmap />

      {/* 2-Column Grid: Recent Sessions & Quick Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardRecentSessions
          sessions={recentSessions}
          isLoading={sessionsLoading}
        />
        <DashboardQuickTasks
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onOpenNewTask={() => setTaskDialogOpen(true)}
        />
      </div>

      {/* Reusable Dialogs */}
      <SessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        subjects={subjects}
        tasks={tasks}
        onSuccess={handleRefreshData}
      />
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        subjects={subjects}
        onSuccess={handleRefreshData}
      />
    </div>
  );
}
