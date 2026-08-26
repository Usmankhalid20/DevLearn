'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/providers/auth-provider';
import { ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null);
      await registerUser(data);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold font-mono tracking-tight text-white">
          Create an account
        </CardTitle>
        <CardDescription className="text-xs text-foreground-secondary">
          Start measuring your learning progress with DevLearn
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-[11px] text-state-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-[11px] text-state-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
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
            <p className="text-[11px] text-foreground-muted">
              Minimum 8 characters with at least one uppercase letter and one number.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <p className="text-center text-xs text-foreground-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
