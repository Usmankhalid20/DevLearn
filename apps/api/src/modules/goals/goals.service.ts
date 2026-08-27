import { prisma } from '../../database/prisma.js';
import { AppError } from '../../common/errors/app-error.js';
import type { CreateGoalInput, UpdateGoalInput } from './goals.types.js';
import type { GoalDto } from '@devlearn/types';

export class GoalsService {
  private calculateGoalProgressFromSessions(
    goal: any,
    sessions: Array<{ subjectId: string; durationMinutes: number; date: Date }>
  ): { currentHours: number; progressPercentage: number } {
    let filtered = sessions;

    if (goal.subjectId) {
      filtered = filtered.filter((s) => s.subjectId === goal.subjectId);
    }
    if (goal.startDate) {
      const start = new Date(goal.startDate).getTime();
      filtered = filtered.filter((s) => new Date(s.date).getTime() >= start);
    }
    if (goal.endDate) {
      const end = new Date(goal.endDate);
      end.setUTCHours(23, 59, 59, 999);
      const endMs = end.getTime();
      filtered = filtered.filter((s) => new Date(s.date).getTime() <= endMs);
    }

    const totalMinutes = filtered.reduce((acc, s) => acc + s.durationMinutes, 0);
    const calculatedHours = Number((totalMinutes / 60).toFixed(1));
    const targetHours = Number((goal.targetMinutes / 60).toFixed(1));
    const currentHours = Math.max(calculatedHours, Number((goal.currentMinutes / 60).toFixed(1)));
    const progressPercentage =
      targetHours > 0 ? Math.min(100, Math.round((currentHours / targetHours) * 100)) : 0;

    return { currentHours, progressPercentage };
  }

  private formatGoalFromSessions(
    goal: any,
    sessions: Array<{ subjectId: string; durationMinutes: number; date: Date }>
  ): GoalDto {
    const { currentHours, progressPercentage } = this.calculateGoalProgressFromSessions(goal, sessions);
    const targetHours = Number((goal.targetMinutes / 60).toFixed(1));

    return {
      id: goal.id,
      userId: goal.userId,
      subjectId: goal.subjectId,
      subject: goal.subject
        ? {
            id: goal.subject.id,
            userId: goal.subject.userId,
            name: goal.subject.name,
            description: goal.subject.description,
            colorToken: goal.subject.colorToken,
            createdAt: goal.subject.createdAt.toISOString(),
            updatedAt: goal.subject.updatedAt.toISOString(),
          }
        : null,
      title: goal.title,
      description: goal.description,
      targetHours,
      currentHours,
      progressPercentage,
      startDate: goal.startDate?.toISOString() ?? null,
      endDate: goal.endDate?.toISOString() ?? null,
      status: goal.status as 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED',
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  }

  private async formatGoal(userId: string, goal: any): Promise<GoalDto> {
    const sessions = await prisma.learningSession.findMany({
      where: { userId },
      select: { subjectId: true, durationMinutes: true, date: true },
    });
    return this.formatGoalFromSessions(goal, sessions);
  }

  async listGoals(userId: string): Promise<GoalDto[]> {
    const [goals, sessions] = await Promise.all([
      prisma.goal.findMany({
        where: { userId },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: { subject: true },
      }),
      prisma.learningSession.findMany({
        where: { userId },
        select: { subjectId: true, durationMinutes: true, date: true },
      }),
    ]);

    return goals.map((g) => this.formatGoalFromSessions(g, sessions));
  }

  async createGoal(userId: string, input: CreateGoalInput): Promise<GoalDto> {
    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) {
        throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
      }
    }

    const targetMinutes = Math.round(input.targetHours * 60);

    const goal = await prisma.goal.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        targetMinutes,
        subjectId: input.subjectId ?? null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: 'IN_PROGRESS',
      },
      include: { subject: true },
    });

    return this.formatGoal(userId, goal);
  }

  async updateGoal(userId: string, id: string, input: UpdateGoalInput): Promise<GoalDto> {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Goal not found', 'GOAL_NOT_FOUND');
    }

    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) {
        throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
      }
    }

    const targetMinutes =
      input.targetHours !== undefined ? Math.round(input.targetHours * 60) : undefined;

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        description: input.description !== undefined ? input.description : undefined,
        targetMinutes,
        subjectId: input.subjectId !== undefined ? input.subjectId : undefined,
        startDate: input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : undefined,
        endDate: input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : undefined,
        status: input.status ?? undefined,
        isAchieved: input.status === 'COMPLETED',
      },
      include: { subject: true },
    });

    return this.formatGoal(userId, updated);
  }

  async deleteGoal(userId: string, id: string): Promise<void> {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Goal not found', 'GOAL_NOT_FOUND');
    }

    await prisma.goal.delete({ where: { id } });
  }
}

export const goalsService = new GoalsService();
