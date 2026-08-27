'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseDialog } from '@/components/courses/course-dialog';
import { CourseCard } from '@/components/courses/course-card';
import { coursesApi, type Course } from '@/lib/courses-api';
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

  const handleToggleComplete = async (course: Course) => {
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
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Course Dialog */}
      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        subjects={subjects}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
