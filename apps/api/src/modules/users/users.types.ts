import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100, 'Name is too long').optional(),
  avatarUrl: z.string().optional().nullable(),
  timezone: z.string().min(1).max(50).optional(),
  dailyGoalMinutes: z.number().int().min(5).max(1440).optional(),
  theme: z.enum(['dark', 'light', 'monochrome']).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
