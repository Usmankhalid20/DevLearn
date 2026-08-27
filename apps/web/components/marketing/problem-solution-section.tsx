import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function ProblemSolutionSection() {
  const problems = [
    'Videos, docs, courses, and articles scattered across 10+ tabs',
    'Uncertainty about actual time spent vs passive watching',
    'No single place to review what you completed this week',
    'Hard to maintain consistent daily study habits without clear feedback',
  ];

  const solutions = [
    'Unified workspace for all self-paced technical learning',
    'Track verified focus minutes with stopwatch or manual logs',
    'Clear separation between intended tasks and actual time spent',
    '52-week learning heatmap that visualizes daily momentum',
  ];

  return (
    <section className="py-20 border-b border-border bg-surface/30">
      <div className="container mx-auto max-w-6xl px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Learning is everywhere. <br />
            <span className="text-foreground-secondary">Your progress is not.</span>
          </h2>
          <p className="text-sm text-foreground-secondary">
            DevLearn bridges the gap between passive consumption and measurable technical mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Without DevLearn */}
          <Card className="border-border bg-surface">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-state-error">
                  Without DevLearn
                </span>
                <span className="text-xs font-mono text-foreground-muted">Scattered &amp; Vague</span>
              </div>

              <ul className="space-y-4 text-xs font-mono text-foreground-secondary">
                {problems.map((prob, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-4 w-4 rounded-full bg-state-error/10 text-state-error flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      ✕
                    </span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* With DevLearn */}
          <Card className="border-white/20 bg-surface shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  With DevLearn
                </span>
                <span className="text-xs font-mono text-foreground-muted">Clear &amp; Actionable</span>
              </div>

              <ul className="space-y-4 text-xs font-mono text-foreground-secondary">
                {solutions.map((sol, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-white shrink-0 mt-0.5" />
                    <span className="text-white font-medium">{sol}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
