import { z } from 'zod';

export const updateSettingsSchema = z.object({
  timezone: z.string().trim().min(1).max(50).optional(),
  dailyGoalMinutes: z.number().int().min(5).max(1440).optional(),
  theme: z.enum(['dark', 'system']).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
