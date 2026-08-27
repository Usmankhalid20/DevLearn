'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AchievementCard } from '@/components/achievements/achievement-card';
import { achievementsApi } from '@/lib/courses-api';

export default function AchievementsPage() {
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: achievementsApi.getAchievements,
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Developer Milestones &amp; Badges
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Verifiable learning achievements unlocked through deliberate practice and consistency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="default" className="font-mono text-xs px-3 py-1">
            {unlockedCount} / {achievements.length} Unlocked
          </Badge>
        </div>
      </div>

      {/* Badges Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((badge) => (
            <AchievementCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
}
