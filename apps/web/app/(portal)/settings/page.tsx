'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { analyticsApi } from '@/lib/analytics-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, User, Clock, Shield } from 'lucide-react';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: analyticsApi.getSettings,
  });

  const [dailyGoal, setDailyGoal] = React.useState<number>(60);
  const [timezone, setTimezone] = React.useState<string>('UTC');

  React.useEffect(() => {
    if (settings) {
      setDailyGoal(settings.dailyGoalMinutes);
      setTimezone(settings.timezone);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: analyticsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      setSuccessMessage('Preferences updated successfully.');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'Failed to update preferences.');
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    mutation.mutate({ dailyGoalMinutes: Number(dailyGoal), timezone });
  };

  if (isError) {
    return (
      <div className="rounded-lg border border-state-error/40 bg-surface p-8 text-center space-y-3">
        <p className="text-sm font-mono text-state-error">Failed to load user settings</p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="font-mono text-xs">
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
          Account &amp; Preferences
        </h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Manage your study targets, timezone, and account credentials.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md border border-white/30 bg-surface p-3 text-xs text-white">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
          {errorMessage}
        </div>
      )}

      {/* Preferences Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-foreground-secondary" />
              Learning Target &amp; Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Configure your daily minimum focus target and local timezone for streak calculations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Goal */}
            <div className="space-y-3">
              <Label htmlFor="daily-goal">Daily Learning Target (Minutes)</Label>
              <div className="flex flex-wrap items-center gap-2">
                {[30, 45, 60, 90, 120].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDailyGoal(preset)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                      dailyGoal === preset
                        ? 'bg-white text-black font-semibold'
                        : 'border border-border bg-surface-elevated text-foreground-secondary hover:text-white'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
              <Input
                id="daily-goal"
                type="number"
                min="5"
                max="1440"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="max-w-xs mt-2"
              />
              <p className="text-[11px] text-foreground-muted font-mono">
                Your daily progress meter on the dashboard will benchmark against this target.
              </p>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="max-w-xs"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-surface text-white">
                    {tz}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-foreground-muted font-mono">
                Used to assign sessions to the correct calendar day for streaks.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button type="submit" disabled={mutation.isPending} className="font-mono text-xs">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Account Info Card */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
            <User className="h-4 w-4 text-foreground-secondary" />
            Profile Details
          </CardTitle>
          <CardDescription className="text-xs">
            Your registered credentials and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-foreground-muted font-mono">Full Name</span>
              <p className="font-semibold text-white">{user?.name || 'Not provided'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-foreground-muted font-mono">Email Address</span>
              <p className="font-semibold text-white">{user?.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-foreground-muted font-mono">Email Status</span>
              <div>
                <Badge
                  variant={user?.isEmailVerified ? 'default' : 'warning'}
                  className="text-[10px]"
                >
                  {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-foreground-muted font-mono">Account Created</span>
              <p className="font-semibold text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Portability Card */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-foreground-secondary" />
            Data Portability &amp; Backups
          </CardTitle>
          <CardDescription className="text-xs">
            Export all your tracked study history, subjects, tasks, and goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-foreground-secondary leading-relaxed">
            You have full ownership of your data. Download your complete historical archive in
            JSON format or spreadsheet-ready CSV format.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/export/json`}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="button" variant="outline" size="sm" className="font-mono text-xs gap-2">
                Download JSON Archive
              </Button>
            </a>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/export/csv`}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="button" variant="outline" size="sm" className="font-mono text-xs gap-2">
                Download Sessions (CSV)
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
