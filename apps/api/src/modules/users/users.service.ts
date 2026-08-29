import { prisma } from '../../database/prisma.js';
import { AppError } from '../../common/errors/app-error.js';
import { ERROR_CODES } from '../../common/errors/error-codes.js';
import { analyticsService } from '../analytics/analytics.service.js';
import type { UpdateUserInput } from './users.types.js';
import type { UserDto, UserSettingsDto } from '@devlearn/types';

export class UsersService {
  /**
   * Helper to format User model to UserDto
   */
  private formatUser(user: {
    id: string;
    email: string;
    name: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Fetch authenticated user's profile and settings
   */
  async getProfile(userId: string): Promise<{ user: UserDto; settings: UserSettingsDto | null }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user) {
      throw new AppError(404, 'User profile not found', ERROR_CODES.NOT_FOUND);
    }

    return {
      user: this.formatUser(user),
      settings: user.settings
        ? {
            timezone: user.settings.timezone,
            dailyGoalMinutes: user.settings.dailyGoalMinutes,
            theme: user.settings.theme,
          }
        : null,
    };
  }

  /**
   * Update profile information and user preferences
   */
  async updateProfile(
    userId: string,
    input: UpdateUserInput
  ): Promise<{ user: UserDto; settings: UserSettingsDto | null }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user) {
      throw new AppError(404, 'User profile not found', ERROR_CODES.NOT_FOUND);
    }

    const { updatedUser, updatedSettings } = await prisma.$transaction(async (tx) => {
      let u = user;
      if (input.name !== undefined) {
        u = await tx.user.update({
          where: { id: userId },
          data: { name: input.name },
          include: { settings: true },
        });
      }

      const settingsData: { timezone?: string; dailyGoalMinutes?: number; theme?: string } = {};
      if (input.timezone !== undefined) settingsData.timezone = input.timezone;
      if (input.dailyGoalMinutes !== undefined) settingsData.dailyGoalMinutes = input.dailyGoalMinutes;
      if (input.theme !== undefined) settingsData.theme = input.theme;

      let s = user.settings;
      if (Object.keys(settingsData).length > 0) {
        s = await tx.userSettings.upsert({
          where: { userId },
          create: {
            userId,
            timezone: settingsData.timezone || 'UTC',
            dailyGoalMinutes: settingsData.dailyGoalMinutes || 60,
            theme: settingsData.theme || 'dark',
          },
          update: settingsData,
        });
      }

      return { updatedUser: u, updatedSettings: s };
    });

    // Invalidate analytics cache if daily goal minutes changed
    if (input.dailyGoalMinutes !== undefined) {
      await analyticsService.invalidateAnalyticsCache(userId);
    }

    return {
      user: this.formatUser(updatedUser),
      settings: updatedSettings
        ? {
            timezone: updatedSettings.timezone,
            dailyGoalMinutes: updatedSettings.dailyGoalMinutes,
            theme: updatedSettings.theme,
          }
        : null,
    };
  }

  /**
   * Permanently delete user account and all associated data
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found', ERROR_CODES.NOT_FOUND);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await analyticsService.invalidateAnalyticsCache(userId);
  }
}

export const usersService = new UsersService();
