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
import { coursesApi } from '@/lib/courses-api';
import { ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import type { SubjectDto } from '@devlearn/types';

const courseSchema = z.object({
  title: z.string().trim().min(1, 'Course title is required').max(200),
  platform: z.string().trim().min(1).max(50),
  url: z.string().optional(),
  totalDurationMinutes: z.coerce.number().int().nonnegative(),
  subjectId: z.string().optional(),
  description: z.string().trim().max(1000).optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: SubjectDto[];
  onSuccess: () => void;
}

export function CourseDialog({ open, onOpenChange, subjects, onSuccess }: CourseDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      platform: 'YouTube',
      url: '',
      totalDurationMinutes: 600,
      subjectId: '',
      description: '',
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    try {
      setErrorMessage(null);
      await coursesApi.createCourse({
        title: data.title,
        platform: data.platform,
        url: data.url || null,
        totalDurationMinutes: data.totalDurationMinutes,
        subjectId: data.subjectId || null,
        description: data.description || undefined,
      });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create course track.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Course / Curriculum Track</DialogTitle>
        <DialogDescription>
          Track self-paced video playlists, textbook roadmaps, or online courses.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
            {errorMessage}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="course-title">Course Title *</Label>
          <Input
            id="course-title"
            placeholder="e.g. MIT 6.824: Distributed Systems"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-[11px] text-state-error">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="course-platform">Platform / Source</Label>
            <Select id="course-platform" {...register('platform')}>
              <option value="YouTube" className="bg-surface text-white">YouTube</option>
              <option value="Coursera" className="bg-surface text-white">Coursera</option>
              <option value="MIT OCW" className="bg-surface text-white">MIT OCW</option>
              <option value="edX" className="bg-surface text-white">edX</option>
              <option value="Textbook" className="bg-surface text-white">Textbook / Book</option>
              <option value="Documentation" className="bg-surface text-white">Documentation</option>
              <option value="Self-Paced" className="bg-surface text-white">Self-Paced</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-subject">Subject Scope</Label>
            <Select id="course-subject" {...register('subjectId')}>
              <option value="" className="bg-surface text-foreground-secondary">
                -- None / General --
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
            <Label htmlFor="course-duration">Estimated Total Length (Minutes)</Label>
            <Input
              id="course-duration"
              type="number"
              min="0"
              placeholder="e.g. 600 (10 hours)"
              {...register('totalDurationMinutes')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="course-url">Course URL (Optional)</Label>
            <Input
              id="course-url"
              type="url"
              placeholder="https://..."
              {...register('url')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="course-desc">Syllabus / Notes (Optional)</Label>
          <Textarea
            id="course-desc"
            placeholder="Modules, chapter breakdown, or prerequisite notes..."
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
              'Create Track'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
