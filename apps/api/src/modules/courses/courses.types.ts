import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, 'Course title is required').max(200),
  platform: z.string().trim().min(1).max(50).default('Custom'),
  url: z.string().url('Please enter a valid URL').optional().nullable().or(z.literal('')),
  description: z.string().trim().max(1000).optional(),
  totalDurationMinutes: z.number().int().nonnegative().default(0),
  subjectId: z.string().uuid().optional().nullable(),
});

export const updateCourseSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  platform: z.string().trim().min(1).max(50).optional(),
  url: z.string().url().nullable().optional().or(z.literal('')),
  description: z.string().trim().max(1000).nullable().optional(),
  totalDurationMinutes: z.number().int().nonnegative().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
