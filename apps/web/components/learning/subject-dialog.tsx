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
import { learningApi } from '@/lib/learning-api';
import { ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const subjectSchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  description: z.string().trim().max(500).optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SubjectDialog({ open, onOpenChange, onSuccess }: SubjectDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = async (data: SubjectFormData) => {
    try {
      setErrorMessage(null);
      await learningApi.createSubject(data);
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create subject. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Learning Subject</DialogTitle>
        <DialogDescription>
          Create a dynamic category to organize sessions and tasks (e.g. DSA, System Design, SQL).
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
            {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="subject-name">Subject Name</Label>
          <Input
            id="subject-name"
            placeholder="e.g. Distributed Systems"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-[11px] text-state-error">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subject-desc">Description (Optional)</Label>
          <Textarea
            id="subject-desc"
            placeholder="Key concepts, goals, or references..."
            {...register('description')}
          />
          {errors.description && (
            <p className="text-[11px] text-state-error">{errors.description.message}</p>
          )}
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
              'Create Subject'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
