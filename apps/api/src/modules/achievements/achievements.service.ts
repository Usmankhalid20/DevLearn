import { prisma } from '../../database/prisma.js';
import type { AchievementDto } from '@devlearn/types';

export class AchievementsService {
  async getAchievements(userId: string): Promise<AchievementDto[]> {
    // 1. Query sessions, contribution days
    const [sessions, contributionDays] = await Promise.all([
      prisma.learningSession.findMany({ where: { userId } }),
      prisma.contributionDay.findMany({ where: { userId } }),
    ]);

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalSessions = sessions.length;
    const maxSingleSession = sessions.reduce((max, s) => Math.max(max, s.durationMinutes), 0);

    // Calculate streak
    const activeDates = new Set(
      contributionDays.filter((d) => d.totalMinutes > 0).map((d) => d.date)
    );
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

    // Distinct subjects with logged sessions
    const subjectIdsWithSessions = new Set(sessions.map((s) => s.subjectId));
    const distinctSubjectCount = subjectIdsWithSessions.size;

    const achievements: AchievementDto[] = [
      {
        id: 'first_session',
        title: 'First Light',
        description: 'Complete your first focused learning session.',
        iconName: 'Sparkles',
        category: 'session',
        isUnlocked: totalSessions >= 1,
        progressPercentage: totalSessions >= 1 ? 100 : 0,
        currentValue: totalSessions,
        targetValue: 1,
        unit: 'sessions',
      },
      {
        id: 'focus_10h',
        title: '10 Hours of Focus',
        description: 'Accumulate 10 total hours of deep study.',
        iconName: 'Clock',
        category: 'time',
        isUnlocked: totalMinutes >= 600,
        progressPercentage: Math.min(100, Math.round((totalMinutes / 600) * 100)),
        currentValue: Number((totalMinutes / 60).toFixed(1)),
        targetValue: 10,
        unit: 'hours',
      },
      {
        id: 'focus_50h',
        title: 'Deep Craft',
        description: 'Accumulate 50 total hours of deliberate practice.',
        iconName: 'Award',
        category: 'time',
        isUnlocked: totalMinutes >= 3000,
        progressPercentage: Math.min(100, Math.round((totalMinutes / 3000) * 100)),
        currentValue: Number((totalMinutes / 60).toFixed(1)),
        targetValue: 50,
        unit: 'hours',
      },
      {
        id: 'streak_7',
        title: '7-Day Momentum',
        description: 'Maintain a 7-day unbroken study streak.',
        iconName: 'Flame',
        category: 'streak',
        isUnlocked: longestStreak >= 7,
        progressPercentage: Math.min(100, Math.round((longestStreak / 7) * 100)),
        currentValue: longestStreak,
        targetValue: 7,
        unit: 'days',
      },
      {
        id: 'streak_30',
        title: 'Consistency Titan',
        description: 'Achieve a 30-day continuous learning streak.',
        iconName: 'ShieldCheck',
        category: 'streak',
        isUnlocked: longestStreak >= 30,
        progressPercentage: Math.min(100, Math.round((longestStreak / 30) * 100)),
        currentValue: longestStreak,
        targetValue: 30,
        unit: 'days',
      },
      {
        id: 'deep_diver',
        title: 'Deep Focus Master',
        description: 'Complete a single uninterrupted session of 120 minutes or longer.',
        iconName: 'Zap',
        category: 'session',
        isUnlocked: maxSingleSession >= 120,
        progressPercentage: Math.min(100, Math.round((maxSingleSession / 120) * 100)),
        currentValue: maxSingleSession,
        targetValue: 120,
        unit: 'minutes',
      },
      {
        id: 'polymath',
        title: 'Multi-Subject Polymath',
        description: 'Log learning sessions across 3 or more distinct subjects.',
        iconName: 'Layers',
        category: 'breadth',
        isUnlocked: distinctSubjectCount >= 3,
        progressPercentage: Math.min(100, Math.round((distinctSubjectCount / 3) * 100)),
        currentValue: distinctSubjectCount,
        targetValue: 3,
        unit: 'subjects',
      },
    ];

    return achievements;
  }
}

export const achievementsService = new AchievementsService();
