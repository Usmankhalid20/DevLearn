import { prisma } from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { CreateGoalInput, UpdateGoalInput } from './goals.types.js';
import type { GoalDto } from '@devlearn/types';

export class GoalsService {
  private async calculateGoalProgress(
    userId: string,
    goal: any
  ): Promise<{ currentHours: number; progressPercentage: number }> {
    const where: any = { userId };

    if (goal.subjectId) {
      where.subjectId = goal.subjectId;
    }
    if (goal.startDate || goal.endDate) {
      where.date = {};
      if (goal.startDate) where.date.gte = new Date(goal.startDate);
      if (goal.endDate) where.date.lte = new Date(goal.endDate);
    }

    const sessions = await prisma.learningSession.findMany({ where });
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const calculatedHours = Number((totalMinutes / 60).toFixed(1));
    const targetHours = Number((goal.targetMinutes / 60).toFixed(1));
    const currentHours = Math.max(calculatedHours, Number((goal.currentMinutes / 60).toFixed(1)));
    const progressPercentage =
      targetHours > 0 ? Math.min(100, Math.round((currentHours / targetHours) * 100)) : 0;

    return { currentHours, progressPercentage };
  }

  private async formatGoal(userId: string, goal: any): Promise<GoalDto> {
    const { currentHours, progressPercentage } = await this.calculateGoalProgress(userId, goal);
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

  async listGoals(userId: string): Promise<GoalDto[]> {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { subject: true },
    });

    return Promise.all(goals.map((g) => this.formatGoal(userId, g)));
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
