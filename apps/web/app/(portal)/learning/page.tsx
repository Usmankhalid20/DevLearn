'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, Clock, Trash2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimerWidget } from '@/components/learning/timer-widget';
import { SessionDialog } from '@/components/learning/session-dialog';
import { SubjectDialog } from '@/components/learning/subject-dialog';
import { learningApi } from '@/lib/learning-api';

export default function LearningPage() {
  const queryClient = useQueryClient();
  const [sessionDialogOpen, setSessionDialogOpen] = React.useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = React.useState(false);
  const [initialMinutes, setInitialMinutes] = React.useState(30);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null);

  // Queries
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: learningApi.getSubjects,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', { isCompleted: false }],
    queryFn: () => learningApi.getTasks({ isCompleted: false }),
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['learning-sessions', { subjectId: selectedSubjectId }],
    queryFn: () =>
      learningApi.getSessions({
        subjectId: selectedSubjectId || undefined,
        limit: 20,
      }),
  });

  const handleTimerComplete = (minutes: number) => {
    setInitialMinutes(minutes);
    setSessionDialogOpen(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['learning-sessions'] });
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm('Are you sure you want to delete this learning session?')) {
      await learningApi.deleteSession(id);
      handleRefresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Learning Workspace
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Focus with the live timer or manually log completed learning activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSubjectDialogOpen(true)}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Subject
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setInitialMinutes(30);
              setSessionDialogOpen(true);
            }}
            disabled={subjects.length === 0}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Session
          </Button>
        </div>
      </div>

      {/* Focus Timer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimerWidget onComplete={handleTimerComplete} />
        </div>

        {/* Dynamic Subjects List */}
        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground-muted">
                Your Subjects
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] font-mono px-2"
                onClick={() => setSubjectDialogOpen(true)}
              >
                + Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {subjects.length === 0 ? (
              <div className="text-center py-6 text-xs text-foreground-muted">
                No subjects yet. Click <strong>+ Add</strong> to create your first subject.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedSubjectId(null)}
                  className={`w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-colors text-left ${
                    selectedSubjectId === null
                      ? 'bg-surface-elevated text-white border border-border'
                      : 'text-foreground-secondary hover:bg-surface-elevated/50'
                  }`}
                >
                  <span>All Subjects</span>
                </button>
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`w-full flex items-center justify-between p-2 rounded text-xs font-mono transition-colors text-left ${
                      selectedSubjectId === sub.id
                        ? 'bg-surface-elevated text-white border border-border'
                        : 'text-foreground-secondary hover:bg-surface-elevated/50'
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    <span className="text-[10px] text-foreground-muted shrink-0">
                      {sub._count?.learningSessions || 0} sessions
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Learning Sessions {selectedSubjectId && '(Filtered)'}
          </h2>
          <span className="text-xs text-foreground-secondary font-mono">
            {sessions.length} logged
          </span>
        </div>

        {sessionsLoading ? (
          <div className="text-center py-12 text-xs text-foreground-muted font-mono">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <Card className="bg-surface text-center py-12">
            <CardContent className="space-y-3">
              <BookOpen className="mx-auto h-8 w-8 text-foreground-muted" />
              <div className="space-y-1">
                <p className="text-sm font-mono text-white">No learning sessions recorded</p>
                <p className="text-xs text-foreground-secondary">
                  Use the timer above or click &quot;Log Session&quot; to add your first entry.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card key={session.id} className="border-border bg-surface transition-colors hover:border-neutral-700">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default" className="font-mono text-xs">
                        {session.subject.name}
                      </Badge>
                      {session.topic && (
                        <span className="text-xs font-semibold text-white font-mono">
                          {session.topic}
                        </span>
                      )}
                      <span className="text-xs text-foreground-muted flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>

                    {session.learnedNotes && (
                      <p className="text-xs text-foreground-secondary line-clamp-2">
                        {session.learnedNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-white">
                        {session.durationMinutes}m
                      </div>
                      <span className="text-[10px] text-foreground-muted font-mono">
                        duration
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-foreground-muted hover:text-state-error"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        subjects={subjects}
        tasks={tasks}
        initialDurationMinutes={initialMinutes}
        onSuccess={handleRefresh}
      />

      <SubjectDialog
        open={subjectDialogOpen}
        onOpenChange={setSubjectDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
