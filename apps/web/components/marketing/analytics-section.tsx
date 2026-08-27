import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { PREVIEW_SUBJECTS } from '@/lib/marketing-data';

export function AnalyticsSection() {
  return (
    <section className="py-20 border-b border-border bg-surface/30">
      <div className="container mx-auto max-w-6xl px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">
            Deep-Dive Analytics
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Understand Where Your Time Goes
          </h2>
          <p className="text-sm text-foreground-secondary">
            DevLearn provides clarity on skill distribution, trends over time, and goal completion.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Metric Cards */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-border bg-surface">
              <CardContent className="p-5 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
                  <span>This Week&apos;s Focus</span>
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">18h 40m</div>
                <p className="text-[11px] font-mono text-foreground-secondary">
                  +3h 15m compared to previous week
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-surface">
              <CardContent className="p-5 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
                  <span>Active Learning Days</span>
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">6 / 7 Days</div>
                <p className="text-[11px] font-mono text-foreground-secondary">
                  85.7% consistency rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-surface">
              <CardContent className="p-5 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary">
                  <span>Tasks Completed</span>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="text-3xl font-bold font-mono text-white">14 Finished</div>
                <p className="text-[11px] font-mono text-foreground-secondary">
                  Across 3 different course modules
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Subject Allocation Breakdown */}
          <div className="lg:col-span-7">
            <Card className="border-border bg-surface">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                    <Layers className="h-4 w-4 text-white" />
                    <span>Subject Distribution</span>
                  </div>
                  <span className="text-xs font-mono text-foreground-muted">Last 30 Days</span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  {PREVIEW_SUBJECTS.map((sub) => (
                    <div key={sub.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{sub.name}</span>
                        <span className="text-foreground-secondary">{sub.time} ({sub.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-border">
                        <div
                          className="h-full bg-white transition-all duration-500"
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
