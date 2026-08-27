import { prisma } from '../../database/prisma.js';
import { AppError } from '../../common/errors/app-error.js';
import { dateStringSchema } from '../../common/validation/validate.js';
import { analyticsService } from '../analytics/analytics.service.js';
import type { CreateLearningSessionInput, UpdateLearningSessionInput } from './learning.types.js';
import type { LearningSessionDto } from '@devlearn/types';
import type { Prisma } from '@prisma/client';

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
   * Recalculates and updates the ContributionDay aggregate for a given user and date within a transaction
   */
  private async syncContributionDay(
    tx: Prisma.TransactionClient,
    userId: string,
    dateStr: string
  ): Promise<void> {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const aggregate = await tx.learningSession.aggregate({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: { durationMinutes: true },
      _count: { id: true },
    });

    const totalMinutes = aggregate._sum.durationMinutes || 0;
    const sessionCount = aggregate._count.id || 0;
    const level = this.calculateContributionLevel(totalMinutes);
    const formattedDate = dateStr.slice(0, 10);

    if (sessionCount === 0) {
      await tx.contributionDay.deleteMany({
        where: { userId, date: formattedDate },
      });
    } else {
      await tx.contributionDay.upsert({
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

  private async assertRelationOwnership(
    userId: string,
    relations: {
      subjectId?: string | null;
      taskId?: string | null;
      courseId?: string | null;
      resourceId?: string | null;
    }
  ): Promise<void> {
    if (relations.subjectId) {
      const subject = await prisma.subject.findFirst({ where: { id: relations.subjectId, userId } });
      if (!subject) throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }
    if (relations.taskId) {
      const task = await prisma.task.findFirst({ where: { id: relations.taskId, userId } });
      if (!task) throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }
    if (relations.courseId) {
      const course = await prisma.course.findFirst({ where: { id: relations.courseId, userId } });
      if (!course) throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
    }
    if (relations.resourceId) {
      const resource = await prisma.resource.findFirst({ where: { id: relations.resourceId, userId } });
      if (!resource) throw new AppError(404, 'Resource not found', 'RESOURCE_NOT_FOUND');
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
      course: session.course
        ? {
            id: session.course.id,
            title: session.course.title,
            platform: session.course.platform,
          }
        : null,
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
   * List learning sessions with optional filtering and pagination
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
    const where: any = { userId };

    if (filters?.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        dateStringSchema.parse(filters.startDate);
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateStringSchema.parse(filters.endDate);
        const end = new Date(filters.endDate);
        // If date-only string was passed (length 10), set to end of that day
        if (filters.endDate.length === 10) {
          end.setUTCHours(23, 59, 59, 999);
        }
        where.date.lte = end;
      }
    }

    const take = filters?.limit ? Math.min(Math.max(1, filters.limit), 100) : 20;
    const skip = filters?.offset ? Math.max(0, filters.offset) : 0;

    const [sessions, total] = await Promise.all([
      prisma.learningSession.findMany({
        where,
        orderBy: { date: 'desc' },
        take,
        skip,
        include: {
          subject: true,
          task: true,
          resource: true,
          course: true,
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
    await this.assertRelationOwnership(userId, {
      subjectId: input.subjectId,
      taskId: input.taskId,
      courseId: input.courseId,
      resourceId: input.resourceId,
    });

    const sessionDate = new Date(input.date);

    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.learningSession.create({
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
          course: true,
        },
      });

      await this.syncContributionDay(tx, userId, sessionDate.toISOString());
      return created;
    });

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

    await this.assertRelationOwnership(userId, {
      subjectId: input.subjectId,
      taskId: input.taskId,
      courseId: input.courseId,
      resourceId: input.resourceId,
    });

    const newDate = input.date ? new Date(input.date) : existing.date;

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.learningSession.update({
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
          courseId: input.courseId !== undefined ? input.courseId : undefined,
        },
        include: {
          subject: true,
          task: true,
          resource: true,
          course: true,
        },
      });

      await this.syncContributionDay(tx, userId, existing.date.toISOString());
      if (existing.date.toISOString().slice(0, 10) !== newDate.toISOString().slice(0, 10)) {
        await this.syncContributionDay(tx, userId, newDate.toISOString());
      }
      return res;
    });

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

    await prisma.$transaction(async (tx) => {
      await tx.learningSession.delete({ where: { id } });
      await this.syncContributionDay(tx, userId, existing.date.toISOString());
    });

    await analyticsService.invalidateAnalyticsCache(userId);
  }
}

export const learningService = new LearningService();
