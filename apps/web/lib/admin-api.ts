import { apiClient } from './api';
import type {
  AdminOverviewDto,
  AdminUsersListResponseDto,
  AdminTelemetryDto,
  AdminAuditLogsResponseDto,
  AdministratorsListResponseDto,
  AdministratorDto,
  CreateAdministratorInputDto,
  UpdateAdministratorPermissionsInputDto,
  UpdateAdministratorStatusInputDto,
  AdminLearningActivityResponseDto,
  AdminResourcesResponseDto,
  PlatformSettingsDto,
  UserRole,
  UserStatus,
  AdminPermission,
} from '@devlearn/types';

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateAdminUserPayload {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: AdminPermission[];
  isEmailVerified?: boolean;
}

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
  targetId?: string;
}

export interface LearningActivityQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  subjectId?: string;
}

export interface ResourcesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

export const adminApi = {
  /**
   * Fetch platform metrics and growth curves
   */
  async getOverview(): Promise<AdminOverviewDto> {
    return apiClient<AdminOverviewDto>('/api/v1/admin/overview');
  },

  /**
   * Fetch paginated list of users with optional filtering
   */
  async getUsers(params: AdminUsersQueryParams = {}): Promise<AdminUsersListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.role) searchParams.set('role', params.role);
    if (params.status) searchParams.set('status', params.status);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient<AdminUsersListResponseDto>(`/api/v1/admin/users${query}`);
  },

  /**
   * Fetch full user details and recent activity
   */
  async getUserDetails(userId: string) {
    return apiClient<any>(`/api/v1/admin/users/${userId}`);
  },

  /**
   * Update user role, status, permissions, or verification
   */
  async updateUser(userId: string, payload: UpdateAdminUserPayload) {
    return apiClient<{ user: any; message: string }>(`/api/v1/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Suspend user account
   */
  async suspendUser(userId: string) {
    return apiClient<{ user: any; message: string }>(`/api/v1/admin/users/${userId}/suspend`, {
      method: 'POST',
    });
  },

  /**
   * Restore suspended user account
   */
  async restoreUser(userId: string) {
    return apiClient<{ user: any; message: string }>(`/api/v1/admin/users/${userId}/restore`, {
      method: 'POST',
    });
  },

  /**
   * Force revoke all active sessions for a user
   */
  async revokeSessions(userId: string) {
    return apiClient<{ message: string; revokedCount: number }>(
      `/api/v1/admin/users/${userId}/revoke-sessions`,
      {
        method: 'POST',
      }
    );
  },

  /**
   * Administratively purge user account
   */
  async deleteUser(userId: string) {
    return apiClient<{ message: string }>(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // ADMINISTRATORS MANAGEMENT (SUPER ADMIN)
  // ==========================================

  /**
   * List all administrators
   */
  async getAdministrators(): Promise<AdministratorsListResponseDto> {
    return apiClient<AdministratorsListResponseDto>('/api/v1/admin/administrators');
  },

  /**
   * Create a new administrator account
   */
  async createAdministrator(payload: CreateAdministratorInputDto): Promise<{ administrator: AdministratorDto; message: string }> {
    return apiClient<{ administrator: AdministratorDto; message: string }>('/api/v1/admin/administrators', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update permissions of an administrator
   */
  async updateAdminPermissions(adminId: string, permissions: AdminPermission[]) {
    return apiClient<{ administrator: any; message: string }>(`/api/v1/admin/administrators/${adminId}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
    });
  },

  /**
   * Update status of an administrator (ACTIVE / DISABLED / SUSPENDED)
   */
  async updateAdminStatus(adminId: string, status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED') {
    return apiClient<{ administrator: any; message: string }>(`/api/v1/admin/administrators/${adminId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // ==========================================
  // LEARNING ACTIVITY & RESOURCES & SETTINGS
  // ==========================================

  /**
   * Fetch platform-wide learning activity oversight
   */
  async getLearningActivities(params: LearningActivityQueryParams = {}): Promise<AdminLearningActivityResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.userId) searchParams.set('userId', params.userId);
    if (params.subjectId) searchParams.set('subjectId', params.subjectId);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient<AdminLearningActivityResponseDto>(`/api/v1/admin/activity${query}`);
  },

  /**
   * Fetch platform resources catalog
   */
  async getResources(params: ResourcesQueryParams = {}): Promise<AdminResourcesResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    if (params.type) searchParams.set('type', params.type);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient<AdminResourcesResponseDto>(`/api/v1/admin/resources${query}`);
  },

  /**
   * Fetch platform settings
   */
  async getPlatformSettings(): Promise<PlatformSettingsDto> {
    return apiClient<PlatformSettingsDto>('/api/v1/admin/settings');
  },

  /**
   * Update platform operational settings
   */
  async updatePlatformSettings(payload: Partial<PlatformSettingsDto>): Promise<{ data: PlatformSettingsDto; message: string }> {
    return apiClient<{ data: PlatformSettingsDto; message: string }>('/api/v1/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Flush Redis cache keys
   */
  async purgeCache(): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/api/v1/admin/operations/purge-cache', {
      method: 'POST',
    });
  },

  /**
   * Fetch live system telemetry and diagnostics
   */
  async getTelemetry(): Promise<AdminTelemetryDto> {
    return apiClient<AdminTelemetryDto>('/api/v1/admin/telemetry');
  },

  /**
   * Fetch paginated security and administration audit trail
   */
  async getAuditLogs(params: AuditLogsQueryParams = {}): Promise<AdminAuditLogsResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.action) searchParams.set('action', params.action);
    if (params.actorId) searchParams.set('actorId', params.actorId);
    if (params.targetId) searchParams.set('targetId', params.targetId);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient<AdminAuditLogsResponseDto>(`/api/v1/admin/audit-logs${query}`);
  },
};
