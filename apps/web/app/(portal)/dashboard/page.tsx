'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, settings, isLoading, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

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
            Today&apos;s target: {settings?.dailyGoalMinutes || 60} minutes • Timezone: {settings?.timezone || 'UTC'}
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            <div className="text-2xl font-bold font-mono text-white">0m</div>
            <p className="text-[11px] text-foreground-secondary mt-1">
              0% of daily goal ({settings?.dailyGoalMinutes || 60}m)
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
            <div className="text-2xl font-bold font-mono text-white">0 days</div>
            <p className="text-[11px] text-foreground-secondary mt-1">Best streak: 0 days</p>
          </CardContent>
        </Card>

        <Card className="bg-surface">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground-muted uppercase">This Week</span>
              <Calendar className="h-4 w-4 text-foreground-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold font-mono text-white">0.0h</div>
            <p className="text-[11px] text-foreground-secondary mt-1">0 learning sessions</p>
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
            <div className="text-2xl font-bold font-mono text-white">0 / 0</div>
            <p className="text-[11px] text-foreground-secondary mt-1">0 pending tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap Placeholder Section */}
      <Card className="bg-surface">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-mono text-white">
                Learning Contribution Calendar
              </CardTitle>
              <CardDescription className="text-xs">
                Monochrome learning activity based on actual tracked minutes
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px]">
              Phase 04 Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5 pb-3">
            <div className="h-3.5 w-3.5 rounded-sm bg-contrib-0 border border-border" />
            <div className="h-3.5 w-3.5 rounded-sm bg-contrib-1 border border-border" />
            <div className="h-3.5 w-3.5 rounded-sm bg-contrib-2 border border-border" />
            <div className="h-3.5 w-3.5 rounded-sm bg-contrib-3 border border-border" />
            <div className="h-3.5 w-3.5 rounded-sm bg-contrib-4 border border-border" />
            <span className="text-[11px] font-mono text-foreground-muted ml-2">
              0m – 120m+ grayscale scale
            </span>
          </div>

          <div className="grid grid-cols-12 gap-1.5 pt-2">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-full rounded-sm border border-border/40 bg-contrib-0"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
