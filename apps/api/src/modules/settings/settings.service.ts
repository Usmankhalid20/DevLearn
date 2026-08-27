import { prisma } from '../../database/prisma.js';
import type { UpdateSettingsInput } from './settings.types.js';
import type { UserSettingsDto } from '@devlearn/types';

export class SettingsService {
  private formatSettings(s: {
    timezone: string;
    dailyGoalMinutes: number;
    theme: string;
  }): UserSettingsDto {
    return {
      timezone: s.timezone,
      dailyGoalMinutes: s.dailyGoalMinutes,
      theme: s.theme,
    };
  }

  async getSettings(userId: string): Promise<UserSettingsDto> {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        timezone: 'UTC',
        dailyGoalMinutes: 60,
        theme: 'dark',
      },
      update: {},
    });

    return this.formatSettings(settings);
  }

  async updateSettings(userId: string, input: UpdateSettingsInput): Promise<UserSettingsDto> {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        timezone: input.timezone ?? 'UTC',
        dailyGoalMinutes: input.dailyGoalMinutes ?? 60,
        theme: input.theme ?? 'dark',
      },
      update: {
        timezone: input.timezone ?? undefined,
        dailyGoalMinutes: input.dailyGoalMinutes ?? undefined,
        theme: input.theme ?? undefined,
      },
    });

    return this.formatSettings(settings);
  }
}

export const settingsService = new SettingsService();
