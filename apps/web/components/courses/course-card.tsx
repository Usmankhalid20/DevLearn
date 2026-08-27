import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, ExternalLink, Check, RotateCcw, Trash2, Clock } from 'lucide-react';
import type { Course } from '@/lib/courses-api';

interface CourseCardProps {
  course: Course;
  onToggleComplete: (course: Course) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CourseCard({ course, onToggleComplete, onDelete }: CourseCardProps) {
  const completedHours = (course.completedDurationMinutes / 60).toFixed(1);
  const totalHours = (course.totalDurationMinutes / 60).toFixed(1);
  const progressPercentage =
    course.totalDurationMinutes > 0
      ? Math.min(100, Math.round((course.completedDurationMinutes / course.totalDurationMinutes) * 100))
      : course.isCompleted
      ? 100
      : 0;

  return (
    <Card className="border-border bg-surface hover:border-neutral-700 transition-colors">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5 truncate">
                <GraduationCap className="h-4 w-4 text-white shrink-0" />
                {course.title}
              </span>
              {course.subject && (
                <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                  {course.subject.name}
                </Badge>
              )}
            </div>

            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-foreground-secondary hover:text-white flex items-center gap-1 transition-colors truncate pt-0.5"
              >
                <span>Curriculum Link</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}
          </div>

          <Badge
            variant={course.isCompleted ? 'default' : 'outline'}
            className="font-mono text-[10px] shrink-0"
          >
            {course.isCompleted ? 'Completed' : `${progressPercentage}%`}
          </Badge>
        </div>

        {/* Progress Bar & Hours */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
            <span>
              Progress: <strong className="text-white">{completedHours}h</strong> / {totalHours}h
            </span>
            <span>{progressPercentage}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-300 ${
                course.isCompleted ? 'bg-state-success' : 'bg-white'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border text-xs font-mono">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleComplete(course)}
            className="h-7 text-xs font-mono gap-1 text-foreground-secondary hover:text-white"
          >
            {course.isCompleted ? (
              <>
                <RotateCcw className="h-3 w-3" /> Reopen Track
              </>
            ) : (
              <>
                <Check className="h-3 w-3" /> Mark Completed
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(course.id)}
            className="h-7 w-7 p-0 text-foreground-muted hover:text-state-error hover:bg-state-error/10"
            title="Delete course"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
