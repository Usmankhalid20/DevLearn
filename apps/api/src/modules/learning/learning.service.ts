import { prisma } from '../../database/prisma.js';
import { AppError } from '../../common/errors/app-error.js';
import { analyticsService } from '../analytics/analytics.service.js';
import type { CreateLearningSessionInput, UpdateLearningSessionInput } from './learning.types.js';
import type { LearningSessionDto } from '@devlearn/types';

export class LearningService {
  /**
   * Helper to calculate grayscale contribution level (0-4) from daily minutes
   */
  public calculateContributionLevel(minutes: number): number {
    if (minutes <= 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 120) return 3;
    return 4;
  }

  /**
   * Recalculates and updates the ContributionDay aggregate for a given user and date
   */
  private async syncContributionDay(userId: string, dateStr: string): Promise<void> {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalMinutes = sessions.reduce((acc: number, s: { durationMinutes: number }) => acc + s.durationMinutes, 0);
    const sessionCount = sessions.length;
    const level = this.calculateContributionLevel(totalMinutes);
    const formattedDate = dateStr.slice(0, 10);

    if (sessionCount === 0) {
      await prisma.contributionDay.deleteMany({
        where: { userId, date: formattedDate },
      });
    } else {
      await prisma.contributionDay.upsert({
        where: {
          userId_date: {
            userId,
            date: formattedDate,
          },
        },
        create: {
          userId,
          date: formattedDate,
          totalMinutes,
          sessionCount,
          level,
        },
        update: {
          totalMinutes,
          sessionCount,
          level,
        },
      });
    }
  }

  private formatSession(session: any): LearningSessionDto {
    return {
      id: session.id,
      userId: session.userId,
      subjectId: session.subjectId,
      subject: {
        id: session.subject.id,
        userId: session.subject.userId,
        name: session.subject.name,
        description: session.subject.description,
        colorToken: session.subject.colorToken,
        createdAt: session.subject.createdAt.toISOString(),
        updatedAt: session.subject.updatedAt.toISOString(),
      },
      taskId: session.taskId,
      task: session.task ? { id: session.task.id, title: session.task.title } : null,
      resourceId: session.resourceId,
      resource: session.resource
        ? {
            id: session.resource.id,
            userId: session.resource.userId,
            title: session.resource.title,
            url: session.resource.url,
            type: session.resource.type,
            createdAt: session.resource.createdAt.toISOString(),
            updatedAt: session.resource.updatedAt.toISOString(),
          }
        : null,
      courseId: session.courseId,
      durationMinutes: session.durationMinutes,
      date: session.date.toISOString(),
      topic: session.topic,
      learnedNotes: session.learnedNotes,
      generalNotes: session.generalNotes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  /**
   * List sessions with optional filters
   */
  async listSessions(
    userId: string,
    filters?: {
      subjectId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ sessions: LearningSessionDto[]; total: number }> {
    const where = {
      userId,
      subjectId: filters?.subjectId ? filters.subjectId : undefined,
      date: {
        gte: filters?.startDate ? new Date(filters.startDate) : undefined,
        lte: filters?.endDate ? new Date(filters.endDate) : undefined,
      },
    };

    const [sessions, total] = await Promise.all([
      prisma.learningSession.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
        include: {
          subject: true,
          task: true,
          resource: true,
        },
      }),
      prisma.learningSession.count({ where }),
    ]);

    return {
      sessions: sessions.map((s: any) => this.formatSession(s)),
      total,
    };
  }

  /**
   * Create a learning session
   */
  async createSession(
    userId: string,
    input: CreateLearningSessionInput
  ): Promise<LearningSessionDto> {
    const subject = await prisma.subject.findFirst({
      where: { id: input.subjectId, userId },
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }

    if (input.taskId) {
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, userId },
      });
      if (!task) {
        throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
      }
    }

    const sessionDate = new Date(input.date);

    const session = await prisma.learningSession.create({
      data: {
        userId,
        subjectId: input.subjectId,
        taskId: input.taskId ?? null,
        resourceId: input.resourceId ?? null,
        courseId: input.courseId ?? null,
        durationMinutes: input.durationMinutes,
        date: sessionDate,
        topic: input.topic ?? null,
        learnedNotes: input.learnedNotes ?? null,
        generalNotes: input.generalNotes ?? null,
      },
      include: {
        subject: true,
        task: true,
        resource: true,
      },
    });

    // Update contribution day aggregate and invalidate cached analytics
    await this.syncContributionDay(userId, sessionDate.toISOString());
    await analyticsService.invalidateAnalyticsCache(userId);

    return this.formatSession(session);
  }

  /**
   * Update a learning session
   */
  async updateSession(
    userId: string,
    id: string,
    input: UpdateLearningSessionInput
  ): Promise<LearningSessionDto> {
    const existing = await prisma.learningSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Learning session not found', 'SESSION_NOT_FOUND');
    }

    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) {
        throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
      }
    }

    const newDate = input.date ? new Date(input.date) : existing.date;

    const updated = await prisma.learningSession.update({
      where: { id },
      data: {
        subjectId: input.subjectId ?? undefined,
        durationMinutes: input.durationMinutes ?? undefined,
        date: input.date ? newDate : undefined,
        topic: input.topic !== undefined ? input.topic : undefined,
        learnedNotes: input.learnedNotes !== undefined ? input.learnedNotes : undefined,
        generalNotes: input.generalNotes !== undefined ? input.generalNotes : undefined,
        taskId: input.taskId !== undefined ? input.taskId : undefined,
        resourceId: input.resourceId !== undefined ? input.resourceId : undefined,
      },
      include: {
        subject: true,
        task: true,
        resource: true,
      },
    });

    // Sync old and new dates if date changed
    await this.syncContributionDay(userId, existing.date.toISOString());
    if (existing.date.toISOString().slice(0, 10) !== newDate.toISOString().slice(0, 10)) {
      await this.syncContributionDay(userId, newDate.toISOString());
    }
    await analyticsService.invalidateAnalyticsCache(userId);

    return this.formatSession(updated);
  }

  /**
   * Delete a learning session
   */
  async deleteSession(userId: string, id: string): Promise<void> {
    const existing = await prisma.learningSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Learning session not found', 'SESSION_NOT_FOUND');
    }

    await prisma.learningSession.delete({ where: { id } });
    await this.syncContributionDay(userId, existing.date.toISOString());
    await analyticsService.invalidateAnalyticsCache(userId);
  }
}

export const learningService = new LearningService();
