'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type RegisterPayload, type LoginPayload } from '@/lib/auth';
import type { UserDto, UserSettingsDto } from '@devlearn/types';

interface AuthContextValue {
  user: UserDto | null;
  settings: UserSettingsDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], res);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], res);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  const value: AuthContextValue = {
    user: data?.user ?? null,
    settings: data?.settings ?? null,
    isLoading,
    isAuthenticated: !!data?.user,
    login: async (payload) => {
      await loginMutation.mutateAsync(payload);
    },
    register: async (payload) => {
      await registerMutation.mutateAsync(payload);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
