'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setErrorMessage(null);
      await authApi.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to send reset link. Please try again.');
      }
    }
  };

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold font-mono tracking-tight text-white">
          Reset your password
        </CardTitle>
        <CardDescription className="text-xs text-foreground-secondary">
          Enter your account email and we will send you a password reset link
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4 text-center py-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            If an account exists for that email, we have sent instructions to reset your password.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Return to login
              </Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] text-state-error">{errors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1 text-xs text-foreground-secondary hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
