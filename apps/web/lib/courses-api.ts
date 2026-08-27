import { apiClient } from './api';
import type { CourseDto, AchievementDto, DiagnosticsDto } from '@devlearn/types';

export type Course = CourseDto;
export type Achievement = AchievementDto;
export type Diagnostics = DiagnosticsDto;

export const coursesApi = {
  async getCourses(): Promise<CourseDto[]> {
    return apiClient<CourseDto[]>('/api/courses');
  },

  async createCourse(data: {
    title: string;
    platform?: string;
    url?: string | null;
    description?: string;
    totalDurationMinutes?: number;
    subjectId?: string | null;
  }): Promise<CourseDto> {
    return apiClient<CourseDto>('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCourse(
    id: string,
    data: {
      title?: string;
      platform?: string;
      url?: string | null;
      description?: string | null;
      totalDurationMinutes?: number;
      subjectId?: string | null;
      isCompleted?: boolean;
    }
  ): Promise<CourseDto> {
    return apiClient<CourseDto>(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/api/courses/${id}`, {
      method: 'DELETE',
    });
  },
};

export const achievementsApi = {
  async getAchievements(): Promise<AchievementDto[]> {
    return apiClient<AchievementDto[]>('/api/achievements');
  },
};

export const systemApi = {
  async getDiagnostics(): Promise<DiagnosticsDto> {
    return apiClient<DiagnosticsDto>('/api/system/diagnostics');
  },
};
