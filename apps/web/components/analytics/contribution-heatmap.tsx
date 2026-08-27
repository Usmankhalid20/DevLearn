'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analytics-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ContributionDayDto } from '@devlearn/types';

interface ContributionHeatmapProps {
  className?: string;
  showCardWrapper?: boolean;
}

export function ContributionHeatmap({
  className,
  showCardWrapper = true,
}: ContributionHeatmapProps) {
  const [hoveredDay, setHoveredDay] = React.useState<ContributionDayDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contribution-calendar'],
    queryFn: analyticsApi.getCalendar,
  });

  const totalMinutes = data?.totalMinutesYear || 0;
  const totalHours = (totalMinutes / 60).toFixed(1);
  const activeDays = data?.totalActiveDays || 0;

  // Group 365 days into calendar weeks aligned to day of week
  const weeks: (ContributionDayDto | null)[][] = React.useMemo(() => {
    const daysList = data?.days || [];
    if (daysList.length === 0) return [];
    const result: (ContributionDayDto | null)[][] = [];

    // Derive leading padding based on first day's UTC day of week (0 = Sunday)
    const firstDayDate = new Date(`${daysList[0].date}T00:00:00Z`);
    const leadingPadding = firstDayDate.getUTCDay();

    let currentWeek: (ContributionDayDto | null)[] = Array(leadingPadding).fill(null);

    daysList.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }

    return result;
  }, [data?.days]);

  const getLevelClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-contrib-1 border-neutral-700';
      case 2:
        return 'bg-contrib-2 border-neutral-600';
      case 3:
        return 'bg-contrib-3 border-neutral-400';
      case 4:
        return 'bg-contrib-4 border-white';
      default:
        return 'bg-contrib-0 border-border/40';
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Calendar Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-[700px]">
          {/* Heatmap Weeks */}
          <div className="flex gap-1.5">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1.5">
                {week.map((day, dayIdx) =>
                  day ? (
                    <div
                      key={day.date}
                      role="img"
                      aria-label={`${day.minutes} minutes on ${day.date}`}
                      tabIndex={0}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onFocus={() => setHoveredDay(day)}
                      onBlur={() => setHoveredDay(null)}
                      className={cn(
                        'h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10 focus:outline-none focus:ring-1 focus:ring-white',
                        getLevelClass(day.level)
                      )}
                    />
                  ) : (
                    <div
                      key={`empty-${weekIdx}-${dayIdx}`}
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm opacity-0 pointer-events-none"
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip & Legend Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border pt-3 text-xs font-mono">
        <div className="text-foreground-secondary">
          {hoveredDay ? (
            <span className="text-white">
              <strong>{hoveredDay.minutes} minutes</strong> ({hoveredDay.sessionCount} sessions) on{' '}
              {new Date(hoveredDay.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          ) : (
            <span className="text-foreground-muted">
              Hover over or focus any day to inspect recorded focus sessions
            </span>
          )}
        </div>

        {/* Grayscale Color Legend */}
        <div className="flex items-center gap-1.5 text-foreground-secondary">
          <span className="text-[11px] mr-1">Less</span>
          <div className="h-3 w-3 rounded-sm bg-contrib-0 border border-border/40" title="0 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-1 border border-neutral-700" title="1-29 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-2 border border-neutral-600" title="30-59 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-3 border border-neutral-400" title="60-119 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-4 border border-white" title="120+ min" />
          <span className="text-[11px] ml-1">More</span>
        </div>
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return <div className={cn(className)}>{content}</div>;
  }

  return (
    <Card className={cn('border-border bg-surface', className)}>
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold font-mono tracking-tight text-white">
              Consistency Matrix
            </CardTitle>
            <CardDescription className="text-xs font-mono text-foreground-secondary mt-0.5">
              365-day monochrome heatmap tracking daily deep work
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              {activeDays} Active Days
            </Badge>
            <Badge variant="default" className="font-mono text-xs">
              {totalHours} Total Hours
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        {isLoading ? (
          <div className="h-36 flex items-center justify-center font-mono text-xs text-foreground-muted">
            Loading activity heatmap...
          </div>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}
