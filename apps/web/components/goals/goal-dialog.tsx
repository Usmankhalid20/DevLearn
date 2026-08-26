'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { goalsApi } from '@/lib/goals-api';
import { ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import type { SubjectDto } from '@devlearn/types';

const goalSchema = z.object({
  title: z.string().trim().min(1, 'Goal title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  targetHours: z.coerce.number().positive('Must be greater than 0 hours').max(10000),
  subjectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: SubjectDto[];
  onSuccess: () => void;
}

export function GoalDialog({ open, onOpenChange, subjects, onSuccess }: GoalDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      targetHours: 40,
      subjectId: '',
      startDate: '',
      endDate: '',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      setErrorMessage(null);
      await goalsApi.createGoal({
        title: data.title,
        description: data.description || undefined,
        targetHours: data.targetHours,
        subjectId: data.subjectId || undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create goal.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Create Learning Goal</DialogTitle>
        <DialogDescription>
          Set a long-term milestone target in hours and track progress automatically.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
            {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="goal-title">Goal Title *</Label>
          <Input
            id="goal-title"
            placeholder="e.g. Master Distributed Systems Architecture"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-[11px] text-state-error">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-target">Target Study Hours *</Label>
            <Input
              id="goal-target"
              type="number"
              min="1"
              max="10000"
              {...register('targetHours')}
            />
            {errors.targetHours && (
              <p className="text-[11px] text-state-error">{errors.targetHours.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-subject">Subject Scope (Optional)</Label>
            <Select id="goal-subject" {...register('subjectId')}>
              <option value="" className="bg-surface text-foreground-secondary">
                -- Overall / All Subjects --
              </option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-surface text-white">
                  {sub.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-start">Start Date (Optional)</Label>
            <Input id="goal-start" type="date" {...register('startDate')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-end">Target Deadline (Optional)</Label>
            <Input id="goal-end" type="date" {...register('endDate')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal-desc">Description / Milestones (Optional)</Label>
          <Textarea
            id="goal-desc"
            placeholder="Key milestones: Read Dynamo paper, build Raft in Go..."
            {...register('description')}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Create Goal'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
