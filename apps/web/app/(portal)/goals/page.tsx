'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoalDialog } from '@/components/goals/goal-dialog';
import { goalsApi } from '@/lib/goals-api';
import { learningApi } from '@/lib/learning-api';

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [goalDialogOpen, setGoalDialogOpen] = React.useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: learningApi.getSubjects,
  });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getGoals,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
  };

  const handleToggleComplete = async (goal: any) => {
    const newStatus = goal.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    await goalsApi.updateGoal(goal.id, { status: newStatus });
    handleRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this goal?')) {
      await goalsApi.deleteGoal(id);
      handleRefresh();
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'IN_PROGRESS');
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Learning Goals &amp; Targets
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Set long-term milestones in study hours and track dynamic progress automatically.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setGoalDialogOpen(true)}
          className="gap-1.5 font-mono text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New Goal
        </Button>
      </div>

      {/* Active Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-foreground-muted flex items-center gap-2">
            <Target className="h-4 w-4 text-white" />
            Active Goals ({activeGoals.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-xs text-foreground-muted font-mono">
            Loading goals...
          </div>
        ) : activeGoals.length === 0 ? (
          <Card className="bg-surface text-center py-12">
            <CardContent className="space-y-2">
              <Target className="mx-auto h-8 w-8 text-foreground-muted" />
              <p className="text-sm font-mono text-white">No active goals</p>
              <p className="text-xs text-foreground-secondary">
                Click &quot;New Goal&quot; above to set a target for your study hours.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => (
              <Card
                key={goal.id}
                className="border-border bg-surface hover:border-neutral-700 transition-colors"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {goal.subject && (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {goal.subject.name}
                          </Badge>
                        )}
                        <Badge
                          variant={goal.progressPercentage >= 100 ? 'default' : 'outline'}
                          className="font-mono text-[10px]"
                        >
                          {goal.progressPercentage}% Complete
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold font-mono text-white">
                        {goal.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-foreground-muted hover:text-white"
                        title="Mark Completed"
                        onClick={() => handleToggleComplete(goal)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-foreground-muted hover:text-state-error"
                        title="Delete Goal"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-foreground-secondary line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold">
                        {goal.currentHours}h / {goal.targetHours}h
                      </span>
                      <span className="text-foreground-muted">
                        {Math.max(0, goal.targetHours - goal.currentHours).toFixed(1)}h remaining
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
                      <div
                        className="h-full bg-white transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  {goal.endDate && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-foreground-muted pt-1 border-t border-border/50">
                      <Calendar className="h-3 w-3" />
                      Target deadline: {new Date(goal.endDate).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-foreground-muted flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-white" />
            Achieved Goals ({completedGoals.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="border-border bg-surface/70">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] font-mono">
                        Achieved
                      </Badge>
                      <span className="text-xs font-mono text-foreground-muted">
                        {goal.currentHours}h / {goal.targetHours}h
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold font-mono text-white">
                      {goal.title}
                    </h3>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-foreground-muted hover:text-state-error"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Goal Dialog */}
      <GoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        subjects={subjects}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
