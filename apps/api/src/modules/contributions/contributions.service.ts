import { prisma } from '../../database/prisma.js';
import type { ContributionCalendarDto, ContributionDayDto, ContributionLevel } from '@devlearn/types';

export class ContributionsService {
  /**
   * Returns a 365-day continuous contribution array ending today in UTC
   */
  async getCalendar(userId: string): Promise<ContributionCalendarDto> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const oneYearAgo = new Date(today);
    oneYearAgo.setUTCDate(today.getUTCDate() - 364);

    const startDateStr = oneYearAgo.toISOString().slice(0, 10);
    const endDateStr = today.toISOString().slice(0, 10);

    const contributionDays = await prisma.contributionDay.findMany({
      where: {
        userId,
        date: {
          gte: startDateStr,
          lte: endDateStr,
        },
      },
    });

    const dayMap = new Map<string, { minutes: number; level: number; sessionCount: number }>();
    for (const d of contributionDays) {
      dayMap.set(d.date, {
        minutes: d.totalMinutes,
        level: d.level,
        sessionCount: d.sessionCount,
      });
    }

    const days: ContributionDayDto[] = [];
    let totalMinutesYear = 0;
    let totalActiveDays = 0;

    const currentIter = new Date(oneYearAgo);
    while (currentIter <= today) {
      const dateKey = currentIter.toISOString().slice(0, 10);
      const data = dayMap.get(dateKey);

      if (data && data.minutes > 0) {
        days.push({
          date: dateKey,
          minutes: data.minutes,
          level: data.level as ContributionLevel,
          sessionCount: data.sessionCount,
        });
        totalMinutesYear += data.minutes;
        totalActiveDays += 1;
      } else {
        days.push({
          date: dateKey,
          minutes: 0,
          level: 0,
          sessionCount: 0,
        });
      }

      currentIter.setUTCDate(currentIter.getUTCDate() + 1);
    }

    return {
      days,
      totalActiveDays,
      totalMinutesYear,
    };
  }
}

export const contributionsService = new ContributionsService();
