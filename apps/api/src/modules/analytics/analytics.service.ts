import { prisma } from '../../database/prisma.js';
import { getRedisClient } from '../../database/redis.js';
import { logger } from '../../common/logging/logger.js';
import type {
  AnalyticsSummaryDto,
  SubjectDistributionDto,
  DailyActivityTrendDto,
} from '@devlearn/types';

const ANALYTICS_CACHE_TTL_SECONDS = 300; // 5 minutes

export class AnalyticsService {
  /**
   * Invalidate cached analytics for a given user
   */
  async invalidateAnalyticsCache(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(`cache:analytics:${userId}`);
    } catch {
      // Non-blocking if Redis is unreachable
    }
  }

  /**
   * Calculates comprehensive analytics metrics for authenticated user with Redis cache-aside
   */
  async getSummary(userId: string): Promise<AnalyticsSummaryDto> {
    const cacheKey = `cache:analytics:${userId}`;

    // 1. Try Redis cache-aside
    try {
      const redis = getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as AnalyticsSummaryDto;
      }
    } catch (err) {
      logger.warn({ err }, 'Redis cache read error, falling back to PostgreSQL');
    }

    // 2. Fetch from PostgreSQL
    const contributionDays = await prisma.contributionDay.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    // 2. Fetch all learning sessions with subjects
    const sessions = await prisma.learningSession.findMany({
      where: { userId },
      include: { subject: true },
    });

    const totalMinutes = sessions.reduce((acc: number, s: { durationMinutes: number }) => acc + s.durationMinutes, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));
    const totalSessions = sessions.length;
    const averageSessionMinutes =
      totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // 3. Calculate Streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(contributionDays);

    // 4. Calculate Subject Breakdown
    const subjectMap = new Map<string, { name: string; minutes: number }>();
    for (const session of sessions) {
      const existing = subjectMap.get(session.subjectId) || {
        name: session.subject.name,
        minutes: 0,
      };
      existing.minutes += session.durationMinutes;
      subjectMap.set(session.subjectId, existing);
    }

    const subjectDistribution: SubjectDistributionDto[] = Array.from(subjectMap.entries())
      .map(([subjectId, data]) => ({
        subjectId,
        subjectName: data.name,
        totalMinutes: data.minutes,
        percentage:
          totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    // 5. Calculate Last 30 Days Activity Trend
    const dailyActivityTrend = this.calculate30DayTrend(contributionDays);

    const summary: AnalyticsSummaryDto = {
      totalMinutes,
      totalHours,
      totalSessions,
      currentStreak,
      longestStreak,
      averageSessionMinutes,
      subjectDistribution,
      dailyActivityTrend,
    };

    // Store in Redis cache asynchronously
    try {
      const redis = getRedisClient();
      await redis.setex(cacheKey, ANALYTICS_CACHE_TTL_SECONDS, JSON.stringify(summary));
    } catch {
      // Non-blocking
    }

    return summary;
  }

  private calculateStreaks(
    contributionDays: { date: string; totalMinutes: number }[]
  ): { currentStreak: number; longestStreak: number } {
    const activeDates = new Set(
      contributionDays.filter((d) => d.totalMinutes > 0).map((d) => d.date)
    );

    if (activeDates.size === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Current streak
    let currentStreak = 0;
    let checkDate = activeDates.has(todayStr)
      ? new Date()
      : activeDates.has(yesterdayStr)
      ? yesterday
      : null;

    if (checkDate) {
      while (true) {
        const dStr = checkDate.toISOString().slice(0, 10);
        if (activeDates.has(dStr)) {
          currentStreak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak
    const sortedDates = Array.from(activeDates).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevTime: number | null = null;

    for (const dStr of sortedDates) {
      const currentTime = new Date(dStr).getTime();
      if (prevTime === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currentTime - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      prevTime = currentTime;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return { currentStreak, longestStreak };
  }

  private calculate30DayTrend(
    contributionDays: { date: string; totalMinutes: number; sessionCount: number }[]
  ): DailyActivityTrendDto[] {
    const dayMap = new Map<string, { minutes: number; sessionCount: number }>();
    for (const d of contributionDays) {
      dayMap.set(d.date, { minutes: d.totalMinutes, sessionCount: d.sessionCount });
    }

    const trend: DailyActivityTrendDto[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const data = dayMap.get(dStr);

      trend.push({
        date: dStr,
        minutes: data?.minutes || 0,
        sessionCount: data?.sessionCount || 0,
      });
    }

    return trend;
  }
}

export const analyticsService = new AnalyticsService();
