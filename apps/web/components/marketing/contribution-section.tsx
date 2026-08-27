import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Flame } from 'lucide-react';

export function ContributionSection() {
  // Generate illustrative 52 weeks mock heatmap data
  const weeks = Array.from({ length: 52 }, (_, wIndex) => {
    return Array.from({ length: 7 }, (_, dIndex) => {
      // Deterministic pseudo-pattern for realistic study habits
      const val = (wIndex * 7 + dIndex) % 5;
      return val;
    });
  });

  const levelColors = [
    'bg-[#1A1A1A] border-[#2A2A2A]/40', // Level 0: 0m
    'bg-[#303030]',                     // Level 1: 1-30m
    'bg-[#555555]',                     // Level 2: 31-60m
    'bg-[#858585]',                     // Level 3: 61-120m
    'bg-[#FFFFFF]',                     // Level 4: 120m+
  ];

  return (
    <section className="py-20 border-b border-border">
      <div className="container mx-auto max-w-6xl px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">
            Activity Visualization
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Your Learning Momentum, Visible.
          </h2>
          <p className="text-sm text-foreground-secondary">
            DevLearn builds an activity heatmap driven entirely by your actual verified learning minutes.
          </p>
        </div>

        <Card className="border-border bg-surface shadow-2xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Calendar className="h-4 w-4 text-white" />
                <span className="font-bold text-white">52-Week Learning Calendar</span>
                <Badge variant="outline" className="text-[10px] ml-2">
                  Monochrome Tonal
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono text-foreground-secondary">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-white" />
                  <span>348 Hours Logged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-white" />
                  <span>84% Active Days</span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[680px]">
                <div className="flex gap-[3px]">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((level, dIdx) => (
                        <div
                          key={dIdx}
                          className={`h-3 w-3 rounded-sm border ${levelColors[level]}`}
                          title={`Week ${wIdx + 1}, Day ${dIdx + 1}: Level ${level}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Level Threshold Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-xs font-mono text-foreground-secondary">
              <span className="text-[11px]">
                Calculated strictly from internal session durations — no GitHub API required.
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px]">Less</span>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-sm border border-[#2A2A2A] bg-[#1A1A1A]" title="0 min" />
                  <div className="h-3 w-3 rounded-sm bg-[#303030]" title="1-30 min" />
                  <div className="h-3 w-3 rounded-sm bg-[#555555]" title="31-60 min" />
                  <div className="h-3 w-3 rounded-sm bg-[#858585]" title="61-120 min" />
                  <div className="h-3 w-3 rounded-sm bg-[#FFFFFF]" title="120+ min" />
                </div>
                <span className="text-[10px]">More</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
