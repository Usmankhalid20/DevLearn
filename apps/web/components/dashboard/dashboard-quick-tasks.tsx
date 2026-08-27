import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, ArrowRight, Plus } from 'lucide-react';
import type { Task } from '@/lib/learning-api';

interface DashboardQuickTasksProps {
  tasks: Task[];
  onToggleTask: (id: string) => Promise<void>;
  onOpenNewTask: () => void;
}

export function DashboardQuickTasks({
  tasks,
  onToggleTask,
  onOpenNewTask,
}: DashboardQuickTasksProps) {
  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  return (
    <Card className="border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-white" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Pending Tasks ({pendingTasks.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenNewTask}
            className="h-7 gap-1 font-mono text-[11px] text-foreground-secondary hover:text-white"
          >
            <Plus className="h-3 w-3" /> New
          </Button>
          <Link href="/tasks">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 font-mono text-[11px] text-foreground-secondary hover:text-white"
            >
              All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-4">
        {pendingTasks.length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-foreground-muted space-y-1">
            <p className="text-white">All caught up! No pending tasks.</p>
            <p className="text-[11px] text-foreground-secondary">
              Add new study objectives or practice problems.
            </p>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {pendingTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="text-foreground-secondary hover:text-white transition-colors shrink-0"
                    title="Mark as completed"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                  <span className="text-white truncate">{task.title}</span>
                </div>

                {task.subject && (
                  <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                    {task.subject.name}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
