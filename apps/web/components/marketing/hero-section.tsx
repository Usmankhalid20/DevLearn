'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Pause, RotateCcw, Sparkles, Clock, Flame, BookOpen } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function HeroSection() {
  const [demoSeconds, setDemoSeconds] = React.useState(2550); // 42m 30s
  const [demoRunning, setDemoRunning] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (demoRunning) {
      interval = setInterval(() => {
        setDemoSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [demoRunning]);

  const formatDemoTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <section className="relative overflow-hidden border-b border-border py-20 lg:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-foreground-secondary">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Spec-driven personal learning SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-mono leading-tight">
              Track what you learn. <br />
              <span className="text-foreground-secondary">See your progress.</span>
            </h1>

            <p className="text-base sm:text-lg text-foreground-secondary max-w-xl leading-relaxed">
              DevLearn helps students and developers record learning duration, organize topics,
              complete tasks, and visualize consistency with a GitHub-style activity calendar.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className={buttonVariants({ size: 'lg', className: 'gap-2 font-mono text-sm' })}
              >
                Start Tracking Free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="#how-it-works"
                className={buttonVariants({ variant: 'outline', size: 'lg', className: 'font-mono text-sm' })}
              >
                See How It Works
              </Link>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border text-xs font-mono text-foreground-secondary">
              <div>
                <strong className="block text-white">100% Private</strong>
                <span>Your data stays yours</span>
              </div>
              <div>
                <strong className="block text-white">No API Keys</strong>
                <span>Zero vendor lock-in</span>
              </div>
              <div>
                <strong className="block text-white">Minimal Dark</strong>
                <span>Focus-first UX</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Product Demo Widget */}
          <div className="lg:col-span-5">
            <Card className="border-border bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="text-[11px] font-mono text-foreground-secondary ml-2">
                    Live Session Demo
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {demoRunning ? 'Recording' : 'Paused'}
                </Badge>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground-secondary uppercase tracking-wider">
                      Subject
                    </span>
                    <Badge variant="default" className="text-[10px] font-mono">
                      System Design
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold font-mono text-white pt-1">
                    Distributed Consensus (Raft)
                  </div>
                </div>

                {/* Clock Display */}
                <div className="rounded-lg border border-border bg-background p-6 text-center space-y-2">
                  <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-white">
                    {formatDemoTime(demoSeconds)}
                  </div>
                  <p className="text-[11px] font-mono text-foreground-secondary">
                    Actual focused minutes recorded
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant={demoRunning ? 'outline' : 'default'}
                    onClick={() => setDemoRunning(!demoRunning)}
                    className="gap-1.5 font-mono text-xs"
                  >
                    {demoRunning ? (
                      <>
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" /> Resume Focus
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDemoSeconds(2550);
                      setDemoRunning(false);
                    }}
                    className="gap-1.5 font-mono text-xs text-foreground-secondary hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>

                {/* Daily Mini Summary */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs font-mono">
                  <div className="flex items-center gap-2 text-foreground-secondary">
                    <Clock className="h-3.5 w-3.5 text-white" />
                    <span>Today: 4h 15m</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-secondary justify-end">
                    <Flame className="h-3.5 w-3.5 text-white" />
                    <span>Streak: 12 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
