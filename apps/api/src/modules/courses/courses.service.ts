import { prisma } from '../../database/prisma.js';
import { AppError } from '../../common/errors/app-error.js';
import type { CreateCourseInput, UpdateCourseInput } from './courses.types.js';
import type { CourseDto } from '@devlearn/types';

export class CoursesService {
  private async formatCourse(course: any): Promise<CourseDto> {
    // Dynamically calculate completed minutes from sessions linked to this course
    const sessions = await prisma.learningSession.findMany({
      where: { courseId: course.id },
    });

    const calculatedMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const completedDurationMinutes = Math.max(calculatedMinutes, course.completedDurationMinutes || 0);

    const progressPercentage =
      course.totalDurationMinutes > 0
        ? Math.min(100, Math.round((completedDurationMinutes / course.totalDurationMinutes) * 100))
        : completedDurationMinutes > 0
        ? 100
        : 0;

    return {
      id: course.id,
      userId: course.userId,
      subjectId: course.subjectId,
      subject: course.subject
        ? {
            id: course.subject.id,
            userId: course.subject.userId,
            name: course.subject.name,
            description: course.subject.description,
            colorToken: course.subject.colorToken,
            createdAt: course.subject.createdAt.toISOString(),
            updatedAt: course.subject.updatedAt.toISOString(),
          }
        : null,
      title: course.title,
      platform: course.platform,
      url: course.url,
      totalDurationMinutes: course.totalDurationMinutes,
      completedDurationMinutes,
      progressPercentage,
      isCompleted: course.isCompleted || progressPercentage >= 100,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  async listCourses(userId: string): Promise<CourseDto[]> {
    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: [{ isCompleted: 'asc' }, { createdAt: 'desc' }],
      include: { subject: true },
    });

    return Promise.all(courses.map((c) => this.formatCourse(c)));
  }

  async createCourse(userId: string, input: CreateCourseInput): Promise<CourseDto> {
    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) {
        throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
      }
    }

    const course = await prisma.course.create({
      data: {
        userId,
        title: input.title,
        platform: input.platform || 'Custom',
        url: input.url || null,
        description: input.description ?? null,
        totalDurationMinutes: input.totalDurationMinutes || 0,
        subjectId: input.subjectId ?? null,
      },
      include: { subject: true },
    });

    return this.formatCourse(course);
  }

  async updateCourse(userId: string, id: string, input: UpdateCourseInput): Promise<CourseDto> {
    const existing = await prisma.course.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
    }

    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) {
        throw new AppError(404, 'Subject not found', 'SUBJECT_NOT_FOUND');
      }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        platform: input.platform ?? undefined,
        url: input.url !== undefined ? (input.url || null) : undefined,
        description: input.description !== undefined ? input.description : undefined,
        totalDurationMinutes: input.totalDurationMinutes ?? undefined,
        subjectId: input.subjectId !== undefined ? input.subjectId : undefined,
        isCompleted: input.isCompleted !== undefined ? input.isCompleted : undefined,
      },
      include: { subject: true },
    });

    return this.formatCourse(updated);
  }

  async deleteCourse(userId: string, id: string): Promise<void> {
    const existing = await prisma.course.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError(404, 'Course not found', 'COURSE_NOT_FOUND');
    }

    await prisma.course.delete({ where: { id } });
  }
}

export const coursesService = new CoursesService();
