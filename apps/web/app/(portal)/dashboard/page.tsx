'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Calendar,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { ContributionHeatmap } from '@/components/analytics/contribution-heatmap';
import { learningApi } from '@/lib/learning-api';

export default function DashboardPage() {
  const router = useRouter();
  const { user, settings, isLoading: authLoading, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch real user data
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['learning-sessions', 'recent'],
    queryFn: () => learningApi.getSessions({ limit: 10 }),
    enabled: isAuthenticated,
  });

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
  const todaySessions = sessions.filter((s) => s.date.slice(0, 10) === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const dailyGoal = settings?.dailyGoalMinutes || 60;
  const goalProgress = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));

  // Calculate total sessions and hours
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-8">
      {/* Verification notice if email not verified */}
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

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Welcome, {user.name || user.email.split('@')[0]}
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Today&apos;s target: {dailyGoal} minutes • Timezone: {settings?.timezone || 'UTC'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/learning">
            <Button size="sm" className="gap-1.5 font-mono text-xs">
              <Plus className="h-3.5 w-3.5" />
              Focus &amp; Log
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Today</span>
              <Clock className="h-4 w-4 text-foreground-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">{todayMinutes}m</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              {goalProgress}% of daily goal ({dailyGoal}m)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Streak</span>
              <Flame className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">
              {todayMinutes > 0 ? '1 day' : '0 days'}
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              {todayMinutes > 0 ? 'Streak active today' : 'Log a session to start streak'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Total Logged</span>
              <Calendar className="h-4 w-4 text-foreground-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">{totalHours}h</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              {sessions.length} learning sessions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">Tasks</span>
              <CheckCircle2 className="h-4 w-4 text-foreground-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">
              {completedTasks.length} / {tasks.length}
            </div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              {pendingTasks.length} pending tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Contribution Calendar Heatmap */}
      <ContributionHeatmap />

      {/* Recent Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Recent Activity
          </h2>
          <Link
            href="/history"
            className="text-xs text-foreground-secondary hover:text-white flex items-center gap-1 font-mono transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {sessionsLoading ? (
          <div className="text-center py-8 text-xs text-foreground-muted font-mono">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <Card className="bg-surface text-center py-10">
            <CardContent className="space-y-2">
              <p className="text-sm font-mono text-white">No activity yet</p>
              <p className="text-xs text-foreground-secondary">
                Start the timer or log your first learning session to populate your dashboard.
              </p>
              <div className="pt-2">
                <Link href="/learning">
                  <Button size="sm" variant="default" className="font-mono text-xs">
                    Go to Learning Workspace
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <Card key={session.id} className="border-border bg-surface hover:border-neutral-700 transition-colors">
                <CardContent className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="font-mono text-xs">
                      {session.subject.name}
                    </Badge>
                    {session.topic && (
                      <span className="text-xs font-semibold text-white font-mono truncate max-w-xs">
                        {session.topic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-foreground-secondary">
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                    <span className="font-bold text-white bg-surface-elevated px-2 py-0.5 rounded border border-border">
                      {session.durationMinutes}m
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
