import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Sparkles,
  Clock,
  Flame,
  ShieldCheck,
  Zap,
  Layers,
  Lock,
} from 'lucide-react';
import type { Achievement } from '@/lib/courses-api';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Clock,
  Award,
  Flame,
  ShieldCheck,
  Zap,
  Layers,
};

interface AchievementCardProps {
  badge: Achievement;
}

export function AchievementCard({ badge }: AchievementCardProps) {
  const IconComponent = ICON_MAP[badge.iconName] || Award;

  return (
    <Card
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
          <h3 className="text-sm font-bold font-mono text-white">{badge.title}</h3>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            {badge.description}
          </p>
        </div>

        {/* Progress bar for locked badge */}
        {!badge.isUnlocked && (
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full rounded-full bg-background overflow-hidden border border-border">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${badge.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {badge.isUnlocked && badge.unlockedAt && (
          <div className="text-[10px] font-mono text-foreground-muted pt-1 border-t border-border/50">
            Earned on {new Date(badge.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
