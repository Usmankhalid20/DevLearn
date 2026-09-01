import { apiClient } from './api';
import type { UserDto, UserSettingsDto } from '@devlearn/types';

export interface UpdateUserPayload {
  name?: string;
  avatarUrl?: string | null;
  timezone?: string;
  dailyGoalMinutes?: number;
  theme?: 'dark' | 'light' | 'monochrome';
}

export interface UserProfileResponse {
  user: UserDto;
  settings: UserSettingsDto | null;
}

export const usersApi = {
  async getMe(): Promise<UserProfileResponse> {
    return apiClient<UserProfileResponse>('/api/v1/users/me', {
      method: 'GET',
    });
  },

  async updateMe(payload: UpdateUserPayload): Promise<UserProfileResponse> {
    return apiClient<UserProfileResponse>('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteMe(): Promise<{ deleted: boolean }> {
    return apiClient<{ deleted: boolean }>('/api/v1/users/me', {
      method: 'DELETE',
    });
  },
};
