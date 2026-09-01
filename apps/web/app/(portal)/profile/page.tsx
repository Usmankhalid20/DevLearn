'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { usersApi } from '@/lib/users-api';
import { showToast } from '@/lib/toast';
import { formatErrorMessage } from '@/lib/api';
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
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  User,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react';

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

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, settings, logout } = useAuth();

  const [name, setName] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [timezone, setTimezone] = React.useState('UTC');
  const [dailyGoal, setDailyGoal] = React.useState(60);
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'monochrome'>('dark');

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync state when user/settings load
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || null);
    }
    if (settings) {
      setTimezone(settings.timezone || 'UTC');
      setDailyGoal(settings.dailyGoalMinutes || 60);
      setTheme((settings.theme as 'dark' | 'light' | 'monochrome') || 'dark');
    }
  }, [user, settings]);

  // Compute initials fallback
  const initials = React.useMemo(() => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'DL';
  }, [name, user?.email]);

  // Handle local avatar file upload & conversion to base64 data URL
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPEG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mutation to update profile
  const updateMutation = useMutation({
    mutationFn: (payload: {
      name?: string;
      avatarUrl?: string | null;
      timezone?: string;
      dailyGoalMinutes?: number;
      theme?: 'dark' | 'light' | 'monochrome';
    }) => usersApi.updateMe(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], {
        user: data.user,
        settings: data.settings,
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });

      showToast.success('Profile and preferences updated successfully!');
      setSuccessMessage('Profile and preferences updated successfully.');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      const message = formatErrorMessage(err);
      setErrorMessage(message);
      showToast.error(err);
      setSuccessMessage(null);
    },
  });

  // Mutation to delete account
  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: () => {
      showToast.info('Account deleted. Logging out...');
      setDeleteDialogOpen(false);
      logout();
    },
    onError: (err: any) => {
      const message = formatErrorMessage(err);
      setErrorMessage(message);
      showToast.error(err);
      setDeleteDialogOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    updateMutation.mutate({
      name: name.trim(),
      avatarUrl,
      timezone,
      dailyGoalMinutes: Number(dailyGoal),
      theme,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
          My Profile
        </h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Customize your user avatar, display name, credentials, and account settings.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md border border-white/30 bg-surface p-3 text-xs text-white">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar & Hero Section Card */}
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
              <Camera className="h-4 w-4 text-foreground-secondary" />
              Profile Photo &amp; Avatar
            </CardTitle>
            <CardDescription className="text-xs">
              Upload a circular avatar photo or display your initials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular Avatar Preview */}
              <div className="relative group">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-surface-elevated text-white font-mono text-2xl font-bold shadow-xl overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name || 'User avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-neutral-200 transition-colors"
                  aria-label="Upload photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Upload Controls */}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-mono text-xs gap-1.5"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Upload Image
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="font-mono text-xs text-state-error hover:bg-state-error/10 hover:text-state-error gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-foreground-muted font-mono">
                  Supported formats: JPEG, PNG, WebP (max 2MB).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details Card */}
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
              <User className="h-4 w-4 text-foreground-secondary" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your display name and view account status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chava Patton"
                className="max-w-md"
                required
              />
            </div>

            {/* Email Address (Readonly) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between max-w-md">
                <Label htmlFor="email">Email Address</Label>
                <Badge
                  variant={user?.isEmailVerified ? 'default' : 'warning'}
                  className="text-[10px] gap-1"
                >
                  {user?.isEmailVerified ? (
                    <>
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-3 w-3" /> Unverified
                    </>
                  )}
                </Badge>
              </div>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="max-w-md bg-surface-elevated/40 text-foreground-secondary cursor-not-allowed"
              />
              <p className="text-[11px] text-foreground-muted font-mono">
                Email address is tied to your login credentials and cannot be modified directly.
              </p>
            </div>

            {/* Account Info Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-md">
              <div className="rounded-md border border-border bg-surface-elevated/40 p-3 space-y-1">
                <span className="text-[11px] font-mono text-foreground-muted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  Account Created
                </span>
                <p className="text-xs font-semibold text-white font-mono">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="rounded-md border border-border bg-surface-elevated/40 p-3 space-y-1">
                <span className="text-[11px] font-mono text-foreground-muted flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  Account Tier
                </span>
                <p className="text-xs font-semibold text-white font-mono">
                  Developer Learner
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning & Interface Preferences */}
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground-secondary" />
              Regional &amp; Focus Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Configure timezone and daily learning metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="max-w-md"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-surface text-white">
                    {tz}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-foreground-muted font-mono">
                Used to compute accurate daily study targets and streak counts.
              </p>
            </div>

            {/* Daily Target */}
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Target (Minutes)</Label>
              <Input
                id="dailyGoal"
                type="number"
                min="5"
                max="1440"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="max-w-md"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="font-mono text-xs gap-1.5"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Danger Zone Card */}
      <Card className="border-state-error/30 bg-surface">
        <CardHeader>
          <CardTitle className="text-sm font-mono text-state-error flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-xs">
            Permanently delete your account and all associated study data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-foreground-secondary leading-relaxed">
            Deleting your account will permanently purge all subjects, courses, study sessions,
            streak logs, and goal records. This action cannot be undone.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="font-mono text-xs text-state-error border-state-error/40 hover:bg-state-error/10 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-state-error">
            <AlertCircle className="h-4 w-4" />
            Confirm Account Deletion
          </DialogTitle>
          <DialogDescription className="mt-2">
            Are you absolutely sure? This will immediately terminate your session and delete all
            historical progress and database records.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(false)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="font-mono text-xs bg-state-error hover:bg-state-error/90 text-white gap-1.5"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Permanently Delete'
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
