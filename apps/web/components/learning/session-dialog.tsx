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
import type { SubjectDto, TaskDto } from '@devlearn/types';

const sessionSchema = z.object({
  subjectId: z.string().min(1, 'Please select a subject'),
  durationMinutes: z.coerce.number().int().min(1, 'Minimum 1 minute').max(1440, 'Max 24 hours'),
  date: z.string().min(1, 'Date is required'),
  topic: z.string().trim().max(200).optional(),
  learnedNotes: z.string().trim().max(2000).optional(),
  taskId: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: SubjectDto[];
  tasks?: TaskDto[];
  initialDurationMinutes?: number;
  onSuccess: () => void;
}

export function SessionDialog({
  open,
  onOpenChange,
  subjects,
  tasks = [],
  initialDurationMinutes = 30,
  onSuccess,
}: SessionDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const getTodayLocalStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      subjectId: subjects[0]?.id || '',
      durationMinutes: initialDurationMinutes,
      date: getTodayLocalStr(),
      topic: '',
      learnedNotes: '',
      taskId: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialDurationMinutes) {
        setValue('durationMinutes', initialDurationMinutes);
      }
      if (subjects.length > 0) {
        setValue('subjectId', subjects[0].id);
      }
      setValue('date', getTodayLocalStr());
    }
  }, [open, initialDurationMinutes, subjects, setValue]);

  const handleClose = () => {
    reset();
    setErrorMessage(null);
    onOpenChange(false);
  };

  const onSubmit = async (data: SessionFormData) => {
    try {
      setErrorMessage(null);
      await learningApi.createSession({
        subjectId: data.subjectId,
        durationMinutes: data.durationMinutes,
        date: new Date(data.date).toISOString(),
        topic: data.topic || undefined,
        learnedNotes: data.learnedNotes || undefined,
        taskId: data.taskId || undefined,
      });
      handleClose();
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to log learning session.');
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>Log Learning Session</DialogTitle>
        <DialogDescription>
          Record your actual learning duration and notes to update your progress and heatmap.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="session-subject">Subject *</Label>
            <Select id="session-subject" {...register('subjectId')}>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-surface text-white">
                  {sub.name}
                </option>
              ))}
            </Select>
            {errors.subjectId && (
              <p className="text-[11px] text-state-error">{errors.subjectId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-duration">Duration (Minutes) *</Label>
            <Input
              id="session-duration"
              type="number"
              min="1"
              max="1440"
              {...register('durationMinutes')}
            />
            {errors.durationMinutes && (
              <p className="text-[11px] text-state-error">{errors.durationMinutes.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="session-date">Date *</Label>
            <Input id="session-date" type="date" {...register('date')} />
            {errors.date && (
              <p className="text-[11px] text-state-error">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-task">Related Task (Optional)</Label>
            <Select id="session-task" {...register('taskId')}>
              <option value="" className="bg-surface text-foreground-secondary">
                -- None --
              </option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id} className="bg-surface text-white">
                  {task.title}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="session-topic">Topic (Optional)</Label>
          <Input
            id="session-topic"
            placeholder="e.g. Inverted Indexing, Raft Consensus"
            {...register('topic')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="session-learned">What I Learned (Optional)</Label>
          <Textarea
            id="session-learned"
            placeholder="Key takeaways, concepts mastered, or formulas..."
            {...register('learnedNotes')}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
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
              'Save Session'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
