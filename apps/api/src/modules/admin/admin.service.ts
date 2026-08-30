import argon2 from 'argon2';
import { prisma } from '../../database/prisma.js';
import { redis } from '../../database/redis.js';
import { NotFoundError, ForbiddenError, AppError } from '../../common/errors/app-error.js';
import type {
  AdminUsersQueryInput,
  UpdateAdminUserInput,
  CreateAdministratorInput,
  UpdateAdminPermissionsInput,
  UpdateAdminStatusInput,
  AuditLogsQueryInput,
  LearningActivityQueryInput,
  ResourcesQueryInput,
  UpdatePlatformSettingsInput,
} from './admin.types.js';
import type {
  AdminOverviewDto,
  AdminUsersListResponseDto,
  AdminTelemetryDto,
  AdminAuditLogsResponseDto,
  AdministratorsListResponseDto,
  AdministratorDto,
  AdminLearningActivityResponseDto,
  AdminResourcesResponseDto,
  PlatformSettingsDto,
  UserRole,
  UserStatus,
  AdminPermission,
} from '@devlearn/types';

function isSuperAdminRole(role?: string | null): boolean {
  return role === 'SUPER_ADMIN' || role === 'SUPERADMIN';
}

export class AdminService {
  /**
   * Helper to write an immutable audit log entry
   */
  async logAudit(params: {
    actorId: string;
    targetId?: string | null;
    action: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    try {
      await (prisma as any).auditLog.create({
        data: {
          actorId: params.actorId,
          targetId: params.targetId ?? null,
          action: params.action,
          ipAddress: params.ipAddress ?? null,
          userAgent: params.userAgent ?? null,
          metadata: (params.metadata as any) ?? undefined,
        },
      });
    } catch (err) {
      console.error('Failed to create audit log entry:', err);
    }
  }

  /**
   * Invariant Check: Ensure operation does not reduce active Super Admins to zero
   */
  private async ensureNotLastSuperAdmin(targetUserId: string): Promise<void> {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return;

    if (isSuperAdminRole(targetUser.role)) {
      const activeSuperAdminCount = await (prisma.user as any).count({
        where: {
          role: { in: ['SUPER_ADMIN', 'SUPERADMIN'] },
          status: 'ACTIVE',
        },
      });

      if (activeSuperAdminCount <= 1) {
        throw new ForbiddenError('Operation rejected: the platform must retain at least one active Super Administrator.');
      }
    }
  }

  /**
   * Invariant Check: Normal Admins cannot modify or affect Super Administrators
   */
  private async enforceSuperAdminBoundary(actorId: string, targetUserId: string): Promise<void> {
    const actor = await prisma.user.findUnique({ where: { id: actorId } });
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!actor || !target) return;

    if (isSuperAdminRole(target.role) && !isSuperAdminRole(actor.role)) {
      throw new ForbiddenError('Access forbidden: Normal administrators cannot modify Super Administrator accounts.');
    }
  }

  /**
   * Platform Overview KPIs & 30-Day Growth Curves
   */
  async getPlatformOverview(): Promise<AdminOverviewDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalSessionsLogged,
      totalTasksCompleted,
      durationAggregate,
      activeUsersList,
      recentUsers,
      recentSessions,
      popularSubjectsData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.learningSession.count(),
      prisma.task.count({ where: { isCompleted: true } }),
      prisma.learningSession.aggregate({
        _sum: { durationMinutes: true },
      }),
      prisma.learningSession.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.learningSession.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        select: { date: true, durationMinutes: true },
        orderBy: { date: 'asc' },
      }),
      prisma.subject.findMany({
        include: {
          _count: { select: { learningSessions: true } },
          learningSessions: { select: { durationMinutes: true } },
        },
        take: 5,
      }),
    ]);

    const activeStreaksCount = await prisma.userSettings.count({
      where: { dailyGoalMinutes: { gt: 0 } },
    });

    const totalMinutes = durationAggregate._sum.durationMinutes || 0;
    const totalLearningHours = Number((totalMinutes / 60).toFixed(1));

    // Daily buckets for signups
    const signupsMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      signupsMap.set(key, 0);
    }
    recentUsers.forEach((u) => {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (signupsMap.has(key)) {
        signupsMap.set(key, (signupsMap.get(key) || 0) + 1);
      }
    });
    const userSignupsPast30Days = Array.from(signupsMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Daily buckets for study minutes
    const studyMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      studyMap.set(key, 0);
    }
    recentSessions.forEach((s) => {
      const key = s.date.toISOString().slice(0, 10);
      if (studyMap.has(key)) {
        studyMap.set(key, (studyMap.get(key) || 0) + s.durationMinutes);
      }
    });
    const studyMinutesPast30Days = Array.from(studyMap.entries()).map(([date, totalMinutes]) => ({
      date,
      totalMinutes,
    }));

    // Popular subjects
    const popularSubjects = popularSubjectsData.map((subj) => ({
      name: subj.name,
      totalMinutes: subj.learningSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0),
      userCount: subj._count.learningSessions,
    }));

    return {
      metrics: {
        totalUsers,
        activeUsersLast30Days: activeUsersList.length,
        totalLearningHours,
        totalSessionsLogged,
        activeStreaksCount,
        totalTasksCompleted,
      },
      growth: {
        userSignupsPast30Days,
        studyMinutesPast30Days,
      },
      popularSubjects,
    };
  }

  /**
   * Paginated and Filtered User Directory
   */
  async getUsers(query: AdminUsersQueryInput): Promise<AdminUsersListResponseDto> {
    const { page, limit, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      if (isSuperAdminRole(role)) {
        where.role = { in: ['SUPER_ADMIN', 'SUPERADMIN'] };
      } else {
        where.role = role;
      }
    }
    if (status) {
      where.status = status;
    }

    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          status: true,
          permissions: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              learningSessions: true,
              subjects: true,
              tasks: true,
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl ?? null,
      role: (u.role as UserRole) || 'USER',
      status: (u.status as UserStatus) || 'ACTIVE',
      permissions: (u.permissions as AdminPermission[]) || [],
      isEmailVerified: Boolean(u.isEmailVerified),
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
      updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt),
      lastLoginAt: u.lastLoginAt ? (u.lastLoginAt instanceof Date ? u.lastLoginAt.toISOString() : String(u.lastLoginAt)) : null,
      _count: u._count,
    }));

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  /**
   * User details inspection
   */
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        subjects: {
          take: 10,
          include: {
            _count: { select: { learningSessions: true, tasks: true } },
          },
        },
        learningSessions: {
          take: 10,
          orderBy: { date: 'desc' },
          include: { subject: { select: { name: true } } },
        },
        _count: {
          select: {
            learningSessions: true,
            subjects: true,
            tasks: true,
            goals: true,
            courses: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update user role, status, or verification
   */
  async updateUser(
    actorId: string,
    targetId: string,
    payload: UpdateAdminUserInput,
    meta: { ipAddress?: string; userAgent?: string }
  ) {
    const existing = await prisma.user.findUnique({ where: { id: targetId } });
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    await this.enforceSuperAdminBoundary(actorId, targetId);

    // Invariant check: cannot demote/disable last active Super Admin
    if (payload.role && !isSuperAdminRole(payload.role) && isSuperAdminRole(existing.role)) {
      await this.ensureNotLastSuperAdmin(targetId);
    }
    if (payload.status && payload.status !== 'ACTIVE' && isSuperAdminRole(existing.role)) {
      await this.ensureNotLastSuperAdmin(targetId);
    }

    // Protection against self-demotion or self-suspension
    if (actorId === targetId) {
      if (payload.role && payload.role !== (existing as any).role) {
        throw new ForbiddenError('Administrators cannot alter their own administrative role.');
      }
      if (payload.status && payload.status !== 'ACTIVE') {
        throw new ForbiddenError('Administrators cannot suspend or deactivate their own account.');
      }
    }

    const updated = await (prisma.user as any).update({
      where: { id: targetId },
      data: {
        name: payload.name !== undefined ? payload.name : undefined,
        role: payload.role as any,
        status: payload.status as any,
        permissions: payload.permissions !== undefined ? payload.permissions : undefined,
        isEmailVerified: payload.isEmailVerified !== undefined ? payload.isEmailVerified : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        permissions: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If user suspended or banned or disabled, purge active sessions
    if (payload.status && payload.status !== 'ACTIVE') {
      await prisma.userSession.deleteMany({ where: { userId: targetId } });
    }

    // Determine audit action
    let auditAction = 'USER_UPDATED';
    if (payload.role && payload.role !== (existing as any).role) {
      auditAction = 'USER_ROLE_UPDATED';
    } else if (payload.status && payload.status !== (existing as any).status) {
      auditAction = payload.status === 'SUSPENDED' ? 'USER_SUSPENDED' : payload.status === 'ACTIVE' ? 'USER_RESTORED' : 'USER_STATUS_UPDATED';
    } else if (payload.isEmailVerified !== undefined && payload.isEmailVerified !== (existing as any).isEmailVerified) {
      auditAction = 'VERIFICATION_OVERRIDDEN';
    }

    await this.logAudit({
      actorId,
      targetId,
      action: auditAction,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: {
        previousRole: (existing as any).role,
        newRole: updated.role,
        previousStatus: (existing as any).status,
        newStatus: updated.status,
        isEmailVerified: updated.isEmailVerified,
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.avatarUrl ?? null,
      role: (updated.role as UserRole) || 'USER',
      status: (updated.status as UserStatus) || 'ACTIVE',
      permissions: (updated.permissions as AdminPermission[]) || [],
      isEmailVerified: Boolean(updated.isEmailVerified),
      createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt),
      updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : String(updated.updatedAt),
    };
  }

  /**
   * Suspend user account
   */
  async suspendUser(actorId: string, targetId: string, meta: { ipAddress?: string; userAgent?: string }) {
    return this.updateUser(actorId, targetId, { status: 'SUSPENDED' }, meta);
  }

  /**
   * Restore suspended user account
   */
  async restoreUser(actorId: string, targetId: string, meta: { ipAddress?: string; userAgent?: string }) {
    return this.updateUser(actorId, targetId, { status: 'ACTIVE' }, meta);
  }

  /**
   * Force revoke all active sessions for a user
   */
  async revokeUserSessions(
    actorId: string,
    targetUserId: string,
    meta: { ipAddress?: string; userAgent?: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.enforceSuperAdminBoundary(actorId, targetUserId);

    const deleted = await prisma.userSession.deleteMany({
      where: { userId: targetUserId },
    });

    await this.logAudit({
      actorId,
      targetId: targetUserId,
      action: 'USER_SESSIONS_REVOKED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { revokedCount: deleted.count },
    });

    return {
      message: `Terminated ${deleted.count} active session(s).`,
      revokedCount: deleted.count,
    };
  }

  /**
   * Administratively purge user account
   */
  async deleteUser(
    actorId: string,
    targetUserId: string,
    meta: { ipAddress?: string; userAgent?: string }
  ) {
    const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    await this.enforceSuperAdminBoundary(actorId, targetUserId);

    // Invariant: Cannot delete last active Super Admin
    if (isSuperAdminRole(existing.role)) {
      await this.ensureNotLastSuperAdmin(targetUserId);
    }

    if (actorId === targetUserId) {
      throw new ForbiddenError('Administrators cannot delete their own account via administrative actions.');
    }

    // Cascade delete user
    await prisma.user.delete({ where: { id: targetUserId } });

    await this.logAudit({
      actorId,
      targetId: targetUserId,
      action: 'USER_DELETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { email: existing.email, name: existing.name, role: existing.role },
    });

    return { message: 'User account permanently deleted.' };
  }

  // ==========================================
  // SUPER ADMIN: ADMINISTRATOR MANAGEMENT
  // ==========================================

  /**
   * List all platform administrators
   */
  async getAdministrators(): Promise<AdministratorsListResponseDto> {
    const admins = await (prisma.user as any).findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        permissions: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    const administrators: AdministratorDto[] = admins.map((a: any) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      avatarUrl: a.avatarUrl ?? null,
      role: (a.role as UserRole) || 'ADMIN',
      status: (a.status as UserStatus) || 'ACTIVE',
      permissions: (a.permissions as AdminPermission[]) || [],
      isEmailVerified: Boolean(a.isEmailVerified),
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
      updatedAt: a.updatedAt instanceof Date ? a.updatedAt.toISOString() : String(a.updatedAt),
      lastLoginAt: a.lastLoginAt ? (a.lastLoginAt instanceof Date ? a.lastLoginAt.toISOString() : String(a.lastLoginAt)) : null,
      lastActivityAt: a.lastLoginAt ? (a.lastLoginAt instanceof Date ? a.lastLoginAt.toISOString() : String(a.lastLoginAt)) : null,
    }));

    return { administrators };
  }

  /**
   * Super Admin creates a new Administrator account with explicit permissions
   */
  async createAdministrator(
    actorId: string,
    input: CreateAdministratorInput,
    meta: { ipAddress?: string; userAgent?: string }
  ): Promise<AdministratorDto> {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      throw new AppError(409, 'An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordToUse = input.password || 'AdminSecret123!';
    const passwordHash = await argon2.hash(passwordToUse, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const created = await (prisma.user as any).create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: 'ADMIN',
        status: 'ACTIVE',
        permissions: input.permissions || [],
        isEmailVerified: true,
        settings: {
          create: {
            dailyGoalMinutes: 60,
            timezone: 'UTC',
            theme: 'dark',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        permissions: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.logAudit({
      actorId,
      targetId: created.id,
      action: 'ADMIN_CREATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: {
        email: created.email,
        assignedPermissions: created.permissions,
      },
    });

    return {
      id: created.id,
      email: created.email,
      name: created.name,
      avatarUrl: created.avatarUrl ?? null,
      role: 'ADMIN',
      status: 'ACTIVE',
      permissions: (created.permissions as AdminPermission[]) || [],
      isEmailVerified: Boolean(created.isEmailVerified),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  /**
   * Super Admin updates permissions of an administrator
   */
  async updateAdminPermissions(
    actorId: string,
    targetAdminId: string,
    input: UpdateAdminPermissionsInput,
    meta: { ipAddress?: string; userAgent?: string }
  ) {
    const existing = await prisma.user.findUnique({ where: { id: targetAdminId } });
    if (!existing) {
      throw new NotFoundError('Administrator not found');
    }

    if (actorId === targetAdminId) {
      throw new ForbiddenError('Super Administrators cannot modify their own permission bundle.');
    }

    const updated = await (prisma.user as any).update({
      where: { id: targetAdminId },
      data: {
        permissions: input.permissions,
      },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true,
        role: true,
        status: true,
      },
    });

    await this.logAudit({
      actorId,
      targetId: targetAdminId,
      action: 'ADMIN_PERMISSIONS_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: {
        previousPermissions: (existing as any).permissions || [],
        newPermissions: updated.permissions,
      },
    });

    return updated;
  }

  /**
   * Super Admin disables or restores an administrator
   */
  async updateAdminStatus(
    actorId: string,
    targetAdminId: string,
    input: UpdateAdminStatusInput,
    meta: { ipAddress?: string; userAgent?: string }
  ) {
    const existing = await prisma.user.findUnique({ where: { id: targetAdminId } });
    if (!existing) {
      throw new NotFoundError('Administrator not found');
    }

    if (actorId === targetAdminId && input.status !== 'ACTIVE') {
      throw new ForbiddenError('Super Administrators cannot disable their own account.');
    }

    // Invariant check: Cannot disable last Super Admin
    if (isSuperAdminRole(existing.role) && input.status !== 'ACTIVE') {
      await this.ensureNotLastSuperAdmin(targetAdminId);
    }

    const updated = await (prisma.user as any).update({
      where: { id: targetAdminId },
      data: { status: input.status },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    // If disabled or suspended, purge active sessions
    if (input.status !== 'ACTIVE') {
      await prisma.userSession.deleteMany({ where: { userId: targetAdminId } });
    }

    await this.logAudit({
      actorId,
      targetId: targetAdminId,
      action: input.status === 'ACTIVE' ? 'ADMIN_RESTORED' : 'ADMIN_DISABLED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: {
        previousStatus: (existing as any).status,
        newStatus: updated.status,
      },
    });

    return updated;
  }

  // ==========================================
  // LEARNING ACTIVITY & RESOURCES
  // ==========================================

  /**
   * High-level Platform Learning Activity Oversight
   */
  async getLearningActivities(query: LearningActivityQueryInput): Promise<AdminLearningActivityResponseDto> {
    const { page, limit, userId, subjectId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (subjectId) where.subjectId = subjectId;

    const [totalCount, sessions] = await Promise.all([
      prisma.learningSession.count({ where }),
      prisma.learningSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          subject: { select: { name: true } },
        },
      }),
    ]);

    const activities = sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: s.user?.name || null,
      userEmail: s.user?.email || '',
      subjectName: s.subject?.name || 'Unassigned',
      durationMinutes: s.durationMinutes,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));

    return {
      activities,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  /**
   * Platform Learning Resources Catalog & Moderation
   */
  async getResources(query: ResourcesQueryInput): Promise<AdminResourcesResponseDto> {
    const { page, limit, search, type } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) {
      where.type = type;
    }

    const [totalCount, resources] = await Promise.all([
      prisma.resource.count({ where }),
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
        },
      }),
    ]);

    const formatted = resources.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      userEmail: r.user?.email || '',
      title: r.title,
      url: r.url,
      type: r.type,
      subjectName: null,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    }));

    return {
      resources: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  // ==========================================
  // PLATFORM SETTINGS & CACHE PURGING
  // ==========================================

  /**
   * Get Platform Operational Settings
   */
  async getPlatformSettings(): Promise<PlatformSettingsDto> {
    const settings = await (prisma as any).platformSetting.findFirst();
    if (!settings) {
      return {
        allowNewRegistrations: true,
        maintenanceMode: false,
        defaultDailyGoalMinutes: 60,
        systemNotification: null,
      };
    }
    return {
      allowNewRegistrations: settings.allowNewRegistrations,
      maintenanceMode: settings.maintenanceMode,
      defaultDailyGoalMinutes: settings.defaultDailyGoalMinutes,
      systemNotification: settings.systemNotification,
    };
  }

  /**
   * Update Platform Operational Settings
   */
  async updatePlatformSettings(
    actorId: string,
    input: UpdatePlatformSettingsInput,
    meta: { ipAddress?: string; userAgent?: string }
  ): Promise<PlatformSettingsDto> {
    let settings = await (prisma as any).platformSetting.findFirst();

    if (!settings) {
      settings = await (prisma as any).platformSetting.create({
        data: {
          allowNewRegistrations: input.allowNewRegistrations ?? true,
          maintenanceMode: input.maintenanceMode ?? false,
          defaultDailyGoalMinutes: input.defaultDailyGoalMinutes ?? 60,
          systemNotification: input.systemNotification ?? null,
        },
      });
    } else {
      settings = await (prisma as any).platformSetting.update({
        where: { id: settings.id },
        data: {
          allowNewRegistrations: input.allowNewRegistrations !== undefined ? input.allowNewRegistrations : undefined,
          maintenanceMode: input.maintenanceMode !== undefined ? input.maintenanceMode : undefined,
          defaultDailyGoalMinutes: input.defaultDailyGoalMinutes !== undefined ? input.defaultDailyGoalMinutes : undefined,
          systemNotification: input.systemNotification !== undefined ? input.systemNotification : undefined,
        },
      });
    }

    await this.logAudit({
      actorId,
      action: 'PLATFORM_SETTINGS_CHANGED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: input as any,
    });

    return {
      allowNewRegistrations: settings.allowNewRegistrations,
      maintenanceMode: settings.maintenanceMode,
      defaultDailyGoalMinutes: settings.defaultDailyGoalMinutes,
      systemNotification: settings.systemNotification,
    };
  }

  /**
   * Purge Redis Cache Keys
   */
  async purgeCache(actorId: string, meta: { ipAddress?: string; userAgent?: string }) {
    try {
      await redis.flushdb();
    } catch (err: any) {
      console.warn('Redis flush warning:', err?.message);
    }

    await this.logAudit({
      actorId,
      action: 'CACHE_PURGED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { target: 'ALL_REDIS_KEYS' },
    });

    return { message: 'Redis cache successfully flushed.' };
  }

  /**
   * System Infrastructure Telemetry
   */
  async getTelemetry(): Promise<AdminTelemetryDto> {
    let dbStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' = 'CONNECTED';
    let dbLatencyMs = 0;

    const startDb = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startDb;
    } catch {
      dbStatus = 'ERROR';
    }

    let redisStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' = 'CONNECTED';
    let redisLatencyMs = 0;
    let redisMemoryKb = 0;

    const startRedis = Date.now();
    try {
      const pong = await redis.ping();
      redisLatencyMs = Date.now() - startRedis;
      if (pong !== 'PONG') {
        redisStatus = 'ERROR';
      }
      const info = await redis.info('memory').catch(() => '');
      const match = info.match(/used_memory:(\d+)/);
      if (match && match[1]) {
        redisMemoryKb = Math.round(parseInt(match[1], 10) / 1024);
      }
    } catch {
      redisStatus = 'ERROR';
    }

    const mem = process.memoryUsage();
    const isDegraded = dbStatus === 'ERROR' || redisStatus === 'ERROR';

    return {
      status: isDegraded ? 'DEGRADED' : 'HEALTHY',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMb: {
          rss: Number((mem.rss / 1024 / 1024).toFixed(1)),
          heapTotal: Number((mem.heapTotal / 1024 / 1024).toFixed(1)),
          heapUsed: Number((mem.heapUsed / 1024 / 1024).toFixed(1)),
        },
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      redis: {
        status: redisStatus,
        latencyMs: redisLatencyMs,
        usedMemoryKb: redisMemoryKb,
      },
    };
  }

  /**
   * Paginated Security Audit Logs
   */
  async getAuditLogs(query: AuditLogsQueryInput): Promise<AdminAuditLogsResponseDto> {
    const { page, limit, action, actorId, targetId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;
    if (targetId) where.targetId = targetId;

    const [totalCount, logs] = await Promise.all([
      (prisma as any).auditLog.count({ where }),
      (prisma as any).auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, email: true },
          },
          target: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    const formattedLogs = logs.map((l: any) => ({
      id: l.id,
      action: l.action,
      actor: l.actor,
      target: l.target ?? null,
      ipAddress: l.ipAddress ?? null,
      userAgent: l.userAgent ?? null,
      metadata: (l.metadata as Record<string, unknown>) ?? null,
      createdAt: l.createdAt.toISOString(),
    }));

    return {
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }
}

export const adminService = new AdminService();
