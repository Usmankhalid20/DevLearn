'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GoalDialog } from '@/components/goals/goal-dialog';
import { GoalCard } from '@/components/goals/goal-card';
import { goalsApi, type Goal } from '@/lib/goals-api';
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

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'IN_PROGRESS' | 'COMPLETED' }) =>
      goalsApi.updateGoal(id, { status }),
    onSuccess: handleRefresh,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalsApi.deleteGoal(id),
    onSuccess: handleRefresh,
  });

  const handleToggleComplete = async (goal: Goal) => {
    const newStatus = goal.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    await toggleMutation.mutateAsync({ id: goal.id, status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this goal?')) {
      await deleteMutation.mutateAsync(id);
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

      {(toggleMutation.isError || deleteMutation.isError) && (
        <div className="rounded-md border border-state-error/40 bg-state-error/10 p-3 text-xs text-state-error">
          Failed to update or delete goal. Please try again.
        </div>
      )}

      {/* Active Goals Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-foreground-muted flex items-center gap-2">
          <Target className="h-4 w-4 text-white" />
          Active Goals ({activeGoals.length})
        </h2>

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
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-foreground-muted">
            Completed Milestones ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* New Goal Dialog */}
      <GoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        subjects={subjects}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
