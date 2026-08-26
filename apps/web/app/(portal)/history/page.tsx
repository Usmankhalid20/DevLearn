'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Calendar, BookOpen, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { learningApi } from '@/lib/learning-api';

export default function HistoryPage() {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: learningApi.getSubjects,
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['learning-sessions', 'all', { subjectId: selectedSubjectId }],
    queryFn: () =>
      learningApi.getSessions({
        subjectId: selectedSubjectId || undefined,
        limit: 100,
      }),
  });

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Learning History
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Chronological timeline of all your completed study sessions.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-foreground-secondary">
          <div className="bg-surface px-3 py-1.5 rounded-md border border-border">
            Total Logged: <strong className="text-white">{totalHours}h</strong> ({totalMinutes}m)
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSubjectId(null)}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              selectedSubjectId === null
                ? 'bg-white text-black font-semibold'
                : 'border border-border bg-surface text-foreground-secondary hover:text-white'
            }`}
          >
            All ({sessions.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                selectedSubjectId === sub.id
                  ? 'bg-white text-black font-semibold'
                  : 'border border-border bg-surface text-foreground-secondary hover:text-white'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Sessions Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-foreground-muted font-mono">
            Loading timeline...
          </div>
        ) : sessions.length === 0 ? (
          <Card className="bg-surface text-center py-12">
            <CardContent className="space-y-2">
              <History className="mx-auto h-8 w-8 text-foreground-muted" />
              <p className="text-sm font-mono text-white">No history records found</p>
              <p className="text-xs text-foreground-secondary">
                Your completed study sessions will appear here chronologically.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative border-l border-border pl-6 space-y-6 ml-3">
            {sessions.map((session) => (
              <div key={session.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-background" />

                <Card className="border-border bg-surface hover:border-neutral-700 transition-colors">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="font-mono text-xs">
                          {session.subject.name}
                        </Badge>
                        {session.topic && (
                          <span className="text-xs font-bold text-white font-mono">
                            {session.topic}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-white bg-surface-elevated px-2 py-0.5 rounded border border-border">
                          {session.durationMinutes}m
                        </span>
                      </div>
                    </div>

                    {session.learnedNotes && (
                      <div className="text-xs text-foreground-secondary pt-1">
                        <span className="text-[10px] font-mono text-foreground-muted uppercase block">
                          What was learned:
                        </span>
                        <p className="mt-0.5 leading-relaxed">{session.learnedNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
