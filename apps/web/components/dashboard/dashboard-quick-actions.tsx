import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Plus, BookOpen, CheckSquare } from 'lucide-react';

interface DashboardQuickActionsProps {
  onOpenSessionDialog: () => void;
  onOpenTaskDialog: () => void;
}

export function DashboardQuickActions({
  onOpenSessionDialog,
  onOpenTaskDialog,
}: DashboardQuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/learning">
        <Button size="sm" className="gap-1.5 font-mono text-xs">
          <Play className="h-3.5 w-3.5" />
          Focus Timer
        </Button>
      </Link>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenSessionDialog}
        className="gap-1.5 font-mono text-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        Log Session
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenTaskDialog}
        className="gap-1.5 font-mono text-xs"
      >
        <CheckSquare className="h-3.5 w-3.5" />
        New Task
      </Button>
    </div>
  );
}
