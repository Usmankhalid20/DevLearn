'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Loader2, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage('Missing reset token. Please request a new link.');
      return;
    }

    try {
      setErrorMessage(null);
      await authApi.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to reset password. The link may have expired.');
      }
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-border bg-surface">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-black mb-2">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-bold font-mono text-white">
            Password updated
          </CardTitle>
          <CardDescription className="text-xs text-foreground-secondary">
            Your password has been changed successfully
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/login')} className="w-full">
            Proceed to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold font-mono tracking-tight text-white">
          Set new password
        </CardTitle>
        <CardDescription className="text-xs text-foreground-secondary">
          Enter and confirm your new account password
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-[11px] text-state-error">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-state-error">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>

          <Link
            href="/login"
            className="text-xs text-center text-foreground-secondary hover:text-white transition-colors"
          >
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
