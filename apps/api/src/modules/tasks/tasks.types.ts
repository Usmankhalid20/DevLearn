import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  subjectId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(200).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
