import { prisma } from '../../database/prisma.js';
import { AppError } from '../../common/errors/app-error.js';
import type { CreateTaskInput, UpdateTaskInput } from './tasks.types.js';
import type { TaskDto } from '@devlearn/types';

export class TasksService {
  private formatTask(task: {
    id: string;
    userId: string;
    subjectId: string | null;
    title: string;
    description: string | null;
    isCompleted: boolean;
    completedAt: Date | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    subject?: {
      id: string;
      userId: string;
      name: string;
      description: string | null;
      colorToken: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }): TaskDto {
    return {
      id: task.id,
      userId: task.userId,
      subjectId: task.subjectId,
      subject: task.subject
        ? {
            id: task.subject.id,
            userId: task.subject.userId,
            name: task.subject.name,
            description: task.subject.description,
            colorToken: task.subject.colorToken,
            createdAt: task.subject.createdAt.toISOString(),
            updatedAt: task.subject.updatedAt.toISOString(),
          }
        : null,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      completedAt: task.completedAt?.toISOString() ?? null,
      dueDate: task.dueDate?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  /**
   * List tasks for user (optionally filtered by subjectId or completion status)
   */
  async listTasks(
    userId: string,
    filters?: { subjectId?: string; isCompleted?: boolean }
  ): Promise<TaskDto[]> {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        subjectId: filters?.subjectId ? filters.subjectId : undefined,
        isCompleted: filters?.isCompleted !== undefined ? filters.isCompleted : undefined,
      },
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
      include: { subject: true },
    });

    return tasks.map((t) => this.formatTask(t));
  }

  /**
   * Create task
   */
  async createTask(userId: string, input: CreateTaskInput): Promise<TaskDto> {
    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) {
        throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
      }
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        subjectId: input.subjectId ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
      include: { subject: true },
    });

    return this.formatTask(task);
  }

  /**
   * Toggle task completion status
   */
  async toggleTask(userId: string, id: string): Promise<TaskDto> {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const newCompletedState = !task.isCompleted;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        isCompleted: newCompletedState,
        completedAt: newCompletedState ? new Date() : null,
      },
      include: { subject: true },
    });

    return this.formatTask(updated);
  }

  /**
   * Update task
   */
  async updateTask(userId: string, id: string, input: UpdateTaskInput): Promise<TaskDto> {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) {
        throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        description: input.description !== undefined ? input.description : undefined,
        subjectId: input.subjectId !== undefined ? input.subjectId : undefined,
        dueDate: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined,
        isCompleted: input.isCompleted !== undefined ? input.isCompleted : undefined,
        completedAt:
          input.isCompleted !== undefined
            ? input.isCompleted
              ? new Date()
              : null
            : undefined,
      },
      include: { subject: true },
    });

    return this.formatTask(updated);
  }

  /**
   * Delete task
   */
  async deleteTask(userId: string, id: string): Promise<void> {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    await prisma.task.delete({ where: { id } });
  }
}

export const tasksService = new TasksService();
