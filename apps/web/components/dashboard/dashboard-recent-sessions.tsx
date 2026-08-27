import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import type { LearningSession } from '@/lib/learning-api';

interface DashboardRecentSessionsProps {
  sessions: LearningSession[];
  isLoading: boolean;
}

export function DashboardRecentSessions({ sessions, isLoading }: DashboardRecentSessionsProps) {
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <Card className="border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-white" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Recent Sessions
          </span>
        </div>
        <Link href="/history">
          <Button variant="ghost" size="sm" className="h-7 gap-1 font-mono text-[11px] text-foreground-secondary hover:text-white">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <CardContent className="p-4">
        {isLoading ? (
          <div className="py-8 text-center font-mono text-xs text-foreground-muted">
            Loading recent activity...
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center font-mono text-xs text-foreground-muted space-y-1">
            <p className="text-white">No learning sessions recorded yet.</p>
            <p className="text-[11px] text-foreground-secondary">
              Use the live timer or log a session in the Learning Workspace.
            </p>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {sessions.slice(0, 5).map((session) => {
              const displayNotes = session.learnedNotes || session.generalNotes;

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px] font-mono shrink-0">
                        {session.subject?.name || 'General'}
                      </Badge>
                      <span className="text-white font-medium truncate">
                        {session.topic || 'Focused Study Session'}
                      </span>
                    </div>
                    {displayNotes && (
                      <p className="text-[11px] text-foreground-secondary line-clamp-1">
                        {displayNotes}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-white block">
                      {formatDuration(session.durationMinutes)}
                    </span>
                    <span className="text-[10px] text-foreground-muted">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
