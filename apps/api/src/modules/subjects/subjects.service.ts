import { prisma } from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { CreateSubjectInput, UpdateSubjectInput } from './subjects.types.js';
import type { SubjectDto } from '@devlearn/types';

export class SubjectsService {
  private formatSubject(subject: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    colorToken: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
      learningSessions: number;
      tasks: number;
    };
  }): SubjectDto {
    return {
      id: subject.id,
      userId: subject.userId,
      name: subject.name,
      description: subject.description,
      colorToken: subject.colorToken,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
      _count: subject._count,
    };
  }

  /**
   * List all subjects for authenticated user
   */
  async listSubjects(userId: string): Promise<SubjectDto[]> {
    const subjects = await prisma.subject.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            learningSessions: true,
            tasks: true,
          },
        },
      },
    });

    return subjects.map((s) => this.formatSubject(s));
  }

  /**
   * Get single subject by ID
   */
  async getSubject(userId: string, id: string): Promise<SubjectDto> {
    const subject = await prisma.subject.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            learningSessions: true,
            tasks: true,
          },
        },
      },
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }

    return this.formatSubject(subject);
  }

  /**
   * Create a new subject
   */
  async createSubject(userId: string, input: CreateSubjectInput): Promise<SubjectDto> {
    const existing = await prisma.subject.findUnique({
      where: {
        userId_name: {
          userId,
          name: input.name,
        },
      },
    });

    if (existing) {
      throw new AppError(409, `Subject "${input.name}" already exists`, 'SUBJECT_ALREADY_EXISTS');
    }

    const subject = await prisma.subject.create({
      data: {
        userId,
        name: input.name,
        description: input.description ?? null,
        colorToken: input.colorToken ?? null,
      },
    });

    return this.formatSubject(subject);
  }

  /**
   * Update an existing subject
   */
  async updateSubject(userId: string, id: string, input: UpdateSubjectInput): Promise<SubjectDto> {
    const subject = await prisma.subject.findFirst({
      where: { id, userId },
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }

    if (input.name && input.name !== subject.name) {
      const existing = await prisma.subject.findUnique({
        where: {
          userId_name: {
            userId,
            name: input.name,
          },
        },
      });

      if (existing) {
        throw new AppError(409, `Subject "${input.name}" already exists`, 'SUBJECT_ALREADY_EXISTS');
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        description: input.description !== undefined ? input.description : undefined,
        colorToken: input.colorToken !== undefined ? input.colorToken : undefined,
      },
    });

    return this.formatSubject(updated);
  }

  /**
   * Delete subject
   */
  async deleteSubject(userId: string, id: string): Promise<void> {
    const subject = await prisma.subject.findFirst({
      where: { id, userId },
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
    }

    await prisma.subject.delete({
      where: { id },
    });
  }
}

export const subjectsService = new SubjectsService();
