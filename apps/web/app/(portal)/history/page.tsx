'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SubjectFilterBar } from '@/components/learning/subject-filter-bar';
import { HistoryTimeline } from '@/components/history/history-timeline';
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

      {/* Filter by Subject */}
      <SubjectFilterBar
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={setSelectedSubjectId}
        totalCount={sessions.length}
      />

      {/* Sessions Timeline */}
      <HistoryTimeline
        sessions={sessions}
        isLoading={isLoading}
      />
    </div>
  );
}
