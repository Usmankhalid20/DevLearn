import { z } from 'zod';
import { dateStringSchema } from '../../common/validation/validate.js';

export const createGoalSchema = z
  .object({
    title: z.string().trim().min(1, 'Goal title is required').max(200),
    description: z.string().trim().max(1000).optional(),
    targetHours: z.number().positive('Target hours must be greater than 0').max(10000),
    subjectId: z.string().uuid().optional().nullable(),
    startDate: dateStringSchema.optional().nullable(),
    endDate: dateStringSchema.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) < new Date(data.startDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date cannot be earlier than start date',
          path: ['endDate'],
        });
      }
    }
  });

export const updateGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    targetHours: z.number().positive().max(10000).optional(),
    subjectId: z.string().uuid().nullable().optional(),
    startDate: dateStringSchema.nullable().optional(),
    endDate: dateStringSchema.nullable().optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) < new Date(data.startDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date cannot be earlier than start date',
          path: ['endDate'],
        });
      }
    }
  });

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
