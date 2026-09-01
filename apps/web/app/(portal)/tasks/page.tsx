'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { TaskDialog } from '@/components/learning/task-dialog';
import { SubjectFilterBar } from '@/components/learning/subject-filter-bar';
import { TaskList } from '@/components/tasks/task-list';
import { learningApi } from '@/lib/learning-api';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [deleteTaskId, setDeleteTaskId] = React.useState<string | null>(null);
  const [filterSubjectId, setFilterSubjectId] = React.useState<string | null>(null);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: learningApi.getSubjects,
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { subjectId: filterSubjectId }],
    queryFn: () => learningApi.getTasks({ subjectId: filterSubjectId || undefined }),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
  };

  const toggleMutation = useMutation({
    mutationFn: learningApi.toggleTask,
    onSuccess: handleRefresh,
  });

  const deleteMutation = useMutation({
    mutationFn: learningApi.deleteTask,
    onSuccess: () => {
      setDeleteTaskId(null);
      handleRefresh();
    },
  });

  const handleToggle = async (id: string) => {
    await toggleMutation.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    setDeleteTaskId(id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Tasks &amp; Objectives
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track intended study topics, assignments, and problem sets. (Tasks are plans, not tracked minutes).
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setTaskDialogOpen(true)}
          className="gap-1.5 font-mono text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </Button>
      </div>

      {/* Filter by Subject */}
      <SubjectFilterBar
        subjects={subjects}
        selectedSubjectId={filterSubjectId}
        onSelectSubject={setFilterSubjectId}
        totalCount={tasks.length}
      />

      {/* Task List Component */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {/* New Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        subjects={subjects}
        onSuccess={handleRefresh}
      />

      {/* Delete Task Modal */}
      <ConfirmModal
        open={Boolean(deleteTaskId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTaskId(null);
        }}
        title="Delete Task"
        description="Are you sure you want to delete this study task? This action cannot be undone."
        confirmLabel="Delete Task"
        variant="danger"
        icon="delete"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteTaskId) {
            await deleteMutation.mutateAsync(deleteTaskId);
          }
        }}
      />
    </div>
  );
}
