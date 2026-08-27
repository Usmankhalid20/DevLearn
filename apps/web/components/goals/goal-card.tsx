import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle2, Clock, Trash2, Calendar, Check, RotateCcw } from 'lucide-react';
import type { Goal } from '@/lib/goals-api';

interface GoalCardProps {
  goal: Goal;
  onToggleComplete: (goal: Goal) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function GoalCard({ goal, onToggleComplete, onDelete }: GoalCardProps) {
  const isCompleted = goal.status === 'COMPLETED';

  return (
    <Card className="border-border bg-surface hover:border-neutral-700 transition-colors">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                <Target className="h-4 w-4 text-white" />
                {goal.title}
              </span>
              {goal.subject && (
                <Badge variant="outline" className="text-[10px] font-mono">
                  {goal.subject.name}
                </Badge>
              )}
            </div>

            {goal.description && (
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>

          <Badge
            variant={isCompleted ? 'default' : 'outline'}
            className="font-mono text-[10px] shrink-0"
          >
            {isCompleted ? 'Completed' : `${goal.progressPercentage}%`}
          </Badge>
        </div>

        {/* Progress Bar & Hours */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
            <span>
              Progress: <strong className="text-white">{goal.currentHours}h</strong> / {goal.targetHours}h
            </span>
            <span>{goal.progressPercentage}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? 'bg-state-success' : 'bg-white'
              }`}
              style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Meta & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs font-mono">
          <div className="flex items-center gap-4 text-foreground-muted text-[11px]">
            {goal.endDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Target: {new Date(goal.endDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleComplete(goal)}
              className="h-7 text-xs font-mono gap-1 text-foreground-secondary hover:text-white"
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="h-3 w-3" /> Reopen
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" /> Mark Done
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="h-7 w-7 p-0 text-foreground-muted hover:text-state-error hover:bg-state-error/10"
              title="Delete goal"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
