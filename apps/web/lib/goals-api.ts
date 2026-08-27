import { apiClient } from './api';
import type { GoalDto } from '@devlearn/types';

export type Goal = GoalDto;

export const goalsApi = {
  async getGoals(): Promise<GoalDto[]> {
    return apiClient<GoalDto[]>('/api/goals');
  },

  async createGoal(data: {
    title: string;
    description?: string;
    targetHours: number;
    subjectId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }): Promise<GoalDto> {
    return apiClient<GoalDto>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGoal(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      targetHours?: number;
      subjectId?: string | null;
      status?: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
    }
  ): Promise<GoalDto> {
    return apiClient<GoalDto>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteGoal(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  },

  getExportJsonUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}/api/export/json`;
  },

  getExportCsvUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}/api/export/csv`;
  },
};
