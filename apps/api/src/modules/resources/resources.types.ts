import { z } from 'zod';

export const createResourceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  url: z.string().url('Please enter a valid URL').trim(),
  type: z.string().trim().max(50).default('url'),
});

export const updateResourceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200).optional(),
  url: z.string().url('Please enter a valid URL').trim().optional(),
  type: z.string().trim().max(50).optional(),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
