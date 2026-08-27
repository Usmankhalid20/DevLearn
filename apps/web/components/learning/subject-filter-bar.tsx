import * as React from 'react';
import type { Subject } from '@/lib/learning-api';

interface SubjectFilterBarProps {
  subjects: Subject[];
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string | null) => void;
  totalCount?: number;
}

export function SubjectFilterBar({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  totalCount,
}: SubjectFilterBarProps) {
  if (subjects.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelectSubject(null)}
        className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
          selectedSubjectId === null
            ? 'bg-white text-black font-semibold'
            : 'border border-border bg-surface text-foreground-secondary hover:text-white'
        }`}
      >
        All {totalCount !== undefined ? `(${totalCount})` : ''}
      </button>

      {subjects.map((sub) => {
        const isSelected = selectedSubjectId === sub.id;

        return (
          <button
            key={sub.id}
            onClick={() => onSelectSubject(sub.id)}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
              isSelected
                ? 'bg-white text-black font-semibold'
                : 'border border-border bg-surface text-foreground-secondary hover:text-white'
            }`}
          >
            {sub.name}
          </button>
        );
      })}
    </div>
  );
}
