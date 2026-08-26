'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Sparkles,
  Clock,
  Flame,
  ShieldCheck,
  Zap,
  Layers,
  Lock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { achievementsApi } from '@/lib/courses-api';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Clock,
  Award,
  Flame,
  ShieldCheck,
  Zap,
  Layers,
};

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
          {achievements.map((badge) => {
            const IconComponent = ICON_MAP[badge.iconName] || Award;

            return (
              <Card
                key={badge.id}
                className={`border transition-all duration-200 ${
                  badge.isUnlocked
                    ? 'border-neutral-500 bg-surface shadow-lg'
                    : 'border-border/40 bg-surface/40 opacity-70'
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border ${
                        badge.isUnlocked
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-surface-elevated text-foreground-muted border-border'
                      }`}
                    >
                      {badge.isUnlocked ? (
                        <IconComponent className="h-5 w-5" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>

                    <Badge
                      variant={badge.isUnlocked ? 'default' : 'outline'}
                      className="font-mono text-[10px]"
                    >
                      {badge.isUnlocked ? 'Unlocked' : `${badge.progressPercentage}%`}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-mono text-white">
                      {badge.title}
                    </h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress towards milestone */}
                  <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-foreground-muted">
                        Progress: {badge.currentValue} / {badge.targetValue} {badge.unit}
                      </span>
                      {badge.isUnlocked && (
                        <span className="text-white flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Achieved
                        </span>
                      )}
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden border border-border/40">
                      <div
                        className="h-full bg-white transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, badge.progressPercentage)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
