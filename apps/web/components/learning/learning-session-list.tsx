import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Trash2, BookOpen } from 'lucide-react';
import type { LearningSession } from '@/lib/learning-api';

interface LearningSessionListProps {
  sessions: LearningSession[];
  isLoading: boolean;
  onDeleteSession: (id: string) => Promise<void>;
}

export function LearningSessionList({
  sessions,
  isLoading,
  onDeleteSession,
}: LearningSessionListProps) {
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center font-mono text-xs text-foreground-muted">
        Loading sessions...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="bg-surface text-center py-12">
        <CardContent className="space-y-2">
          <BookOpen className="mx-auto h-8 w-8 text-foreground-muted" />
          <p className="text-sm font-mono text-white">No sessions recorded</p>
          <p className="text-xs text-foreground-secondary">
            Use the live focus timer above or click &quot;Log Session&quot; to add your first entry.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 font-mono text-xs">
      {sessions.map((session) => {
        const displayNotes = session.learnedNotes || session.generalNotes;

        return (
          <Card
            key={session.id}
            className="border-border bg-surface hover:border-neutral-700 transition-colors"
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="text-[10px] font-mono">
                    {session.subject?.name || 'General'}
                  </Badge>
                  <span className="text-white font-semibold text-sm truncate">
                    {session.topic || 'General Learning Session'}
                  </span>
                </div>

                {displayNotes && (
                  <p className="text-xs text-foreground-secondary font-sans leading-relaxed">
                    {displayNotes}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                  {session.resource && (
                    <span className="text-foreground-secondary underline truncate max-w-[200px]">
                      {session.resource.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                <div className="text-right">
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-foreground-secondary" />
                    {formatDuration(session.durationMinutes)}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSession(session.id)}
                  className="h-8 w-8 p-0 text-foreground-muted hover:text-state-error hover:bg-state-error/10"
                  title="Delete session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
