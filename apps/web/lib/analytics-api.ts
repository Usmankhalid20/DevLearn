import { apiClient } from './api';
import type {
  ContributionCalendarDto,
  AnalyticsSummaryDto,
  UserSettingsDto,
} from '@devlearn/types';

export type AnalyticsSummary = AnalyticsSummaryDto;
export type ContributionCalendar = ContributionCalendarDto;
export type UserSettings = UserSettingsDto;

export const analyticsApi = {
  async getCalendar(): Promise<ContributionCalendarDto> {
    return apiClient<ContributionCalendarDto>('/api/contributions/calendar');
  },

  async getSummary(): Promise<AnalyticsSummaryDto> {
    return apiClient<AnalyticsSummaryDto>('/api/analytics/summary');
  },

  async getSettings(): Promise<UserSettingsDto> {
    return apiClient<UserSettingsDto>('/api/settings');
  },

  async updateSettings(data: {
    dailyGoalMinutes?: number;
    timezone?: string;
    theme?: 'dark' | 'system';
  }): Promise<UserSettingsDto> {
    return apiClient<UserSettingsDto>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
