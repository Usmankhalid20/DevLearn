import { z } from 'zod';

export const createLearningSessionSchema = z.object({
  subjectId: z.string().uuid('Valid subject ID is required'),
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  topic: z.string().trim().max(200).optional().nullable(),
  learnedNotes: z.string().trim().max(2000).optional().nullable(),
  generalNotes: z.string().trim().max(5000).optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  resourceId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid().optional().nullable(),
});

export const updateLearningSessionSchema = z.object({
  subjectId: z.string().uuid().optional(),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  topic: z.string().trim().max(200).nullable().optional(),
  learnedNotes: z.string().trim().max(2000).nullable().optional(),
  generalNotes: z.string().trim().max(5000).nullable().optional(),
  taskId: z.string().uuid().nullable().optional(),
  resourceId: z.string().uuid().nullable().optional(),
  courseId: z.string().uuid().nullable().optional(),
});

export type CreateLearningSessionInput = z.infer<typeof createLearningSessionSchema>;
export type UpdateLearningSessionInput = z.infer<typeof updateLearningSessionSchema>;
