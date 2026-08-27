import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, Trash2, Calendar, Tag } from 'lucide-react';
import type { Task } from '@/lib/learning-api';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:border-neutral-700 transition-colors gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 text-foreground-secondary hover:text-white transition-colors shrink-0"
          title={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.isCompleted ? (
            <CheckSquare className="h-4 w-4 text-white" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>

        <div className="space-y-1 min-w-0">
          <span
            className={`text-sm font-semibold font-mono block truncate ${
              task.isCompleted ? 'line-through text-foreground-muted' : 'text-white'
            }`}
          >
            {task.title}
          </span>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-foreground-muted">
            {task.subject && (
              <Badge variant="outline" className="text-[10px]">
                {task.subject.name}
              </Badge>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="h-8 w-8 p-0 text-foreground-muted hover:text-state-error hover:bg-state-error/10 shrink-0"
        title="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
