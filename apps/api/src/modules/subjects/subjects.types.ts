import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  description: z.string().trim().max(500).optional(),
  colorToken: z.string().trim().max(50).optional(),
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required').max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  colorToken: z.string().trim().max(50).nullable().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
