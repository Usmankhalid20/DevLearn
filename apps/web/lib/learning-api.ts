import { apiClient } from './api';
import type {
  SubjectDto,
  TaskDto,
  LearningSessionDto,
  ResourceDto,
} from '@devlearn/types';

export type Subject = SubjectDto;
export type Task = TaskDto;
export type LearningSession = LearningSessionDto;
export type Resource = ResourceDto;

export const learningApi = {
  // Subjects
  async getSubjects(): Promise<SubjectDto[]> {
    return apiClient<SubjectDto[]>('/api/subjects');
  },

  async createSubject(data: { name: string; description?: string; colorToken?: string }): Promise<SubjectDto> {
    return apiClient<SubjectDto>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSubject(id: string, data: { name?: string; description?: string | null }): Promise<SubjectDto> {
    return apiClient<SubjectDto>(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteSubject(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  async getTasks(filters?: { subjectId?: string; isCompleted?: boolean }): Promise<TaskDto[]> {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.isCompleted !== undefined) params.append('isCompleted', String(filters.isCompleted));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<TaskDto[]>(`/api/tasks${query}`);
  },

  async createTask(data: { title: string; description?: string; subjectId?: string | null; dueDate?: string | null }): Promise<TaskDto> {
    return apiClient<TaskDto>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleTask(id: string): Promise<TaskDto> {
    return apiClient<TaskDto>(`/api/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Learning Sessions
  async getSessions(filters?: { subjectId?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }): Promise<LearningSessionDto[]> {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<LearningSessionDto[]>(`/api/sessions${query}`);
  },

  async createSession(data: {
    subjectId: string;
    durationMinutes: number;
    date: string;
    topic?: string;
    learnedNotes?: string;
    generalNotes?: string;
    taskId?: string | null;
    courseId?: string | null;
    resourceId?: string | null;
  }): Promise<LearningSessionDto> {
    return apiClient<LearningSessionDto>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteSession(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  },

  // Resources
  async getResources(): Promise<ResourceDto[]> {
    return apiClient<ResourceDto[]>('/api/resources');
  },

  async createResource(data: { title: string; url: string; type?: string }): Promise<ResourceDto> {
    return apiClient<ResourceDto>('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteResource(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  },
};
