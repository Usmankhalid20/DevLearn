import { apiClient } from './api';
import type { AuthSessionDto, UserDto } from '@devlearn/types';

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthSessionDto> {
    return apiClient<AuthSessionDto>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<AuthSessionDto> {
    return apiClient<AuthSessionDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<AuthSessionDto> {
    return apiClient<AuthSessionDto>('/api/auth/me', {
      method: 'GET',
    });
  },

  async verifyEmail(token: string): Promise<{ user: UserDto; message: string }> {
    return apiClient<{ user: UserDto; message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string; debugToken?: string }> {
    return apiClient<{ message: string; debugToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};
