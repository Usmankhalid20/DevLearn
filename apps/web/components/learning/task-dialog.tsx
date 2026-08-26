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
import { learningApi } from '@/lib/learning-api';
import { ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import type { SubjectDto } from '@devlearn/types';

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  subjectId: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: SubjectDto[];
  onSuccess: () => void;
}

export function TaskDialog({ open, onOpenChange, subjects, onSuccess }: TaskDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', subjectId: '', dueDate: '' },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      setErrorMessage(null);
      await learningApi.createTask({
        title: data.title,
        description: data.description || undefined,
        subjectId: data.subjectId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create task.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Learning Task</DialogTitle>
        <DialogDescription>
          Plan a topic or assignment to complete. (Tasks represent intended work, not tracked duration).
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
            {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="task-title">Task Title *</Label>
          <Input
            id="task-title"
            placeholder="e.g. Complete LeetCode #200 (Number of Islands)"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-[11px] text-state-error">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-subject">Subject (Optional)</Label>
            <Select id="task-subject" {...register('subjectId')}>
              <option value="" className="bg-surface text-foreground-secondary">
                -- General --
              </option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-surface text-white">
                  {sub.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-duedate">Due Date (Optional)</Label>
            <Input id="task-duedate" type="date" {...register('dueDate')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-desc">Notes / Resources (Optional)</Label>
          <Textarea
            id="task-desc"
            placeholder="Links, checklist, or objectives..."
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
              'Create Task'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
