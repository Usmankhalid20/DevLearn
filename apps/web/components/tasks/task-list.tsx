import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Square } from 'lucide-react';
import { TaskItem } from './task-item';
import type { Task } from '@/lib/learning-api';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskList({ tasks, isLoading, onToggle, onDelete }: TaskListProps) {
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  if (isLoading) {
    return (
      <div className="py-12 text-center font-mono text-xs text-foreground-muted">
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="bg-surface text-center py-12">
        <CardContent className="space-y-2">
          <CheckSquare className="mx-auto h-8 w-8 text-foreground-muted" />
          <p className="text-sm font-mono text-white">No tasks created</p>
          <p className="text-xs text-foreground-secondary">
            Click &quot;New Task&quot; above to add planned problems, assignments, or study topics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Tasks */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-foreground-secondary uppercase tracking-wider">
          Pending Objectives ({pendingTasks.length})
        </h3>
        {pendingTasks.length === 0 ? (
          <div className="rounded-lg border border-border/40 bg-surface/40 p-4 text-center text-xs font-mono text-foreground-muted">
            All current tasks completed. Excellent momentum!
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-xs font-bold font-mono text-foreground-muted uppercase tracking-wider">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2 opacity-75">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
