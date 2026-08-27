'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analytics-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Group 365 days into columns of 7 days (weeks)
  const weeks: ContributionDayDto[][] = React.useMemo(() => {
    const daysList = data?.days || [];
    if (daysList.length === 0) return [];
    const result: ContributionDayDto[][] = [];
    let currentWeek: ContributionDayDto[] = [];

    daysList.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === daysList.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

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
          {/* Weekday indicator & Heatmap Weeks */}
          <div className="flex gap-1.5">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm border transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10 ${getLevelClass(
                      day.level
                    )}`}
                  />
                ))}
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
              {activeDays} active learning days • {totalHours}h logged in past year
            </span>
          )}
        </div>

        {/* Monochrome Levels Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-foreground-muted">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-contrib-0 border border-border/40" title="0 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-1 border border-neutral-700" title="1-29 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-2 border border-neutral-600" title="30-59 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-3 border border-neutral-400" title="60-119 min" />
          <div className="h-3 w-3 rounded-sm bg-contrib-4 border border-white" title="120+ min" />
          <span>More</span>
        </div>
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return content;
  }

  return (
    <Card className={`border-border bg-surface text-foreground ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-mono text-white">
              Learning Activity Calendar
            </CardTitle>
            <CardDescription className="text-xs text-foreground-secondary">
              Actual tracked learning sessions over the past 365 days
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {totalHours}h Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-28 flex items-center justify-center text-xs text-foreground-muted font-mono">
            Loading activity heatmap...
          </div>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}
