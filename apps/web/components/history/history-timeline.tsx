import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Calendar, Clock } from 'lucide-react';
import type { LearningSession } from '@/lib/learning-api';

interface HistoryTimelineProps {
  sessions: LearningSession[];
  isLoading: boolean;
}

export function HistoryTimeline({ sessions, isLoading }: HistoryTimelineProps) {
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-xs text-foreground-muted font-mono">
        Loading timeline...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="bg-surface text-center py-12">
        <CardContent className="space-y-2">
          <History className="mx-auto h-8 w-8 text-foreground-muted" />
          <p className="text-sm font-mono text-white">No history records found</p>
          <p className="text-xs text-foreground-secondary">
            Your completed study sessions will appear here chronologically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative border-l border-border pl-6 space-y-6 ml-3">
      {sessions.map((session) => {
        const displayNotes = session.learnedNotes || session.generalNotes;

        return (
          <div key={session.id} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-background shadow" />

            <div className="rounded-lg border border-border bg-surface p-4 space-y-2 hover:border-neutral-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-mono text-[10px]">
                    {session.subject?.name || 'General'}
                  </Badge>
                  <span className="font-bold font-mono text-sm text-white">
                    {session.topic || 'General Learning Session'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-foreground-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-white" />
                    <strong className="text-white">{formatDuration(session.durationMinutes)}</strong>
                  </span>
                  <span className="text-foreground-muted">•</span>
                  <span className="flex items-center gap-1 text-foreground-muted">
                    <Calendar className="h-3 w-3" />
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {displayNotes && (
                <p className="text-xs font-sans text-foreground-secondary leading-relaxed pt-1">
                  {displayNotes}
                </p>
              )}

              {session.resource && (
                <div className="text-[11px] font-mono text-foreground-muted pt-1">
                  Resource: <span className="text-white underline">{session.resource.title}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
