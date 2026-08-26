'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckSquare, Square, Trash2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskDialog } from '@/components/learning/task-dialog';
import { SubjectDialog } from '@/components/learning/subject-dialog';
import { learningApi } from '@/lib/learning-api';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = React.useState(false);
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

  const handleToggle = async (id: string) => {
    await learningApi.toggleTask(id);
    handleRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await learningApi.deleteTask(id);
      handleRefresh();
    }
  };

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Tasks & Objectives
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track intended study topics, assignments, and problem sets. (Tasks are plans, not tracked minutes).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setTaskDialogOpen(true)}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Subject Filter Pills */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterSubjectId(null)}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              filterSubjectId === null
                ? 'bg-white text-black font-semibold'
                : 'border border-border bg-surface text-foreground-secondary hover:text-white'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setFilterSubjectId(sub.id)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                filterSubjectId === sub.id
                  ? 'bg-white text-black font-semibold'
                  : 'border border-border bg-surface text-foreground-secondary hover:text-white'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-foreground-muted">
              Pending ({pendingTasks.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-xs text-foreground-muted font-mono">
              Loading tasks...
            </div>
          ) : pendingTasks.length === 0 ? (
            <Card className="bg-surface text-center py-8">
              <CardContent className="space-y-2">
                <p className="text-sm font-mono text-white">No pending tasks</p>
                <p className="text-xs text-foreground-secondary">
                  Click &quot;New Task&quot; above to create a plan for your study session.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <Card
                  key={task.id}
                  className="border-border bg-surface hover:border-neutral-700 transition-colors"
                >
                  <CardContent className="p-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggle(task.id)}
                        className="mt-0.5 text-foreground-secondary hover:text-white transition-colors"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-white font-mono">
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-xs text-foreground-secondary line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {task.subject && (
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {task.subject.name}
                            </Badge>
                          )}
                          {task.dueDate && (
                            <span className="text-[11px] text-foreground-muted flex items-center gap-1 font-mono">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-foreground-muted hover:text-state-error shrink-0"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-foreground-muted">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-2 opacity-75">
              {completedTasks.map((task) => (
                <Card key={task.id} className="border-border bg-surface/60">
                  <CardContent className="p-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggle(task.id)}
                        className="mt-0.5 text-white"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                      <div>
                        <div className="text-sm font-medium text-foreground-secondary line-through font-mono">
                          {task.title}
                        </div>
                        {task.completedAt && (
                          <span className="text-[10px] text-foreground-muted font-mono">
                            Completed {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-foreground-muted hover:text-state-error shrink-0"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        subjects={subjects}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
