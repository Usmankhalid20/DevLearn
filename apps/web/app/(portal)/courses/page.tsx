'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseDialog } from '@/components/courses/course-dialog';
import { coursesApi } from '@/lib/courses-api';
import { learningApi } from '@/lib/learning-api';

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: learningApi.getSubjects,
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.getCourses,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['courses'] });
  };

  const handleToggleComplete = async (course: any) => {
    await coursesApi.updateCourse(course.id, { isCompleted: !course.isCompleted });
    handleRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this course track?')) {
      await coursesApi.deleteCourse(id);
      handleRefresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Courses &amp; Structured Tracks
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track completion progress across video series, textbooks, and roadmaps.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCourseDialogOpen(true)}
          className="gap-1.5 font-mono text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Track
        </Button>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-foreground-muted font-mono">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <Card className="bg-surface text-center py-12">
          <CardContent className="space-y-2">
            <GraduationCap className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="text-sm font-mono text-white">No courses tracked</p>
            <p className="text-xs text-foreground-secondary">
              Click &quot;Add Track&quot; above to organize your self-paced learning curricula.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const completedHours = (course.completedDurationMinutes / 60).toFixed(1);
            const totalHours = (course.totalDurationMinutes / 60).toFixed(1);

            return (
              <Card
                key={course.id}
                className="border-border bg-surface hover:border-neutral-700 transition-colors"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default" className="font-mono text-[10px]">
                          {course.platform}
                        </Badge>
                        {course.subject && (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {course.subject.name}
                          </Badge>
                        )}
                        <Badge
                          variant={course.isCompleted ? 'default' : 'outline'}
                          className="font-mono text-[10px]"
                        >
                          {course.isCompleted ? 'Completed' : `${course.progressPercentage}%`}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold font-mono text-white">
                        {course.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-foreground-muted hover:text-white"
                        title="Toggle Completed"
                        onClick={() => handleToggleComplete(course)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-foreground-muted hover:text-state-error"
                        title="Delete Course"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-xs text-foreground-secondary line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold">
                        {completedHours}h logged {course.totalDurationMinutes > 0 && `/ ${totalHours}h`}
                      </span>
                      <span className="text-foreground-muted">
                        {course.progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
                      <div
                        className="h-full bg-white transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, course.progressPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* URL link if exists */}
                  {course.url && (
                    <div className="pt-1 border-t border-border/50">
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-foreground-secondary hover:text-white font-mono transition-colors"
                      >
                        <Globe className="h-3 w-3" />
                        <span className="truncate max-w-xs">{course.url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        subjects={subjects}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
