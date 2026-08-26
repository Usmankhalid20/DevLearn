'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Flame,
  CheckCircle2,
  BookOpen,
  Layers,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function MarketingPage() {
  // Interactive preview state for the hero demo
  const [demoSeconds, setDemoSeconds] = React.useState(1500); // 25 min default
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
    <div className="flex flex-col min-h-screen bg-base text-foreground select-none">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-base/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-white text-black font-black font-mono text-xs">
              DL
            </div>
            <span className="font-mono font-bold tracking-tight text-white text-lg">
              DevLearn
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-mono text-xs">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-mono text-xs">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-foreground-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Monochrome Learning-Progress Tracker for Developers
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl font-black font-mono tracking-tight text-white leading-tight">
          Measure what you learn. <br />
          <span className="text-neutral-400">Build developer momentum.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm sm:text-base text-foreground-secondary leading-relaxed">
          Stop wondering where your study hours went. DevLearn tracks actual focused minutes,
          maintains your personal monochrome contribution calendar, and quantifies your skill mastery.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/register">
            <Button size="lg" className="gap-2 font-mono text-sm px-8 h-12">
              Start Free Today
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="font-mono text-sm h-12">
              Sign In to Portal
            </Button>
          </Link>
        </div>

        {/* Live Interactive Product Preview */}
        <div className="mx-auto max-w-4xl pt-10">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-neutral-800" />
                <div className="h-3 w-3 rounded-full bg-neutral-800" />
                <div className="h-3 w-3 rounded-full bg-neutral-800" />
                <span className="ml-2 font-mono text-xs text-foreground-muted">
                  devlearn.app / portal
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                Live Interactive Demo
              </Badge>
            </div>

            {/* Demo Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mini Timer */}
              <div className="rounded-lg border border-border bg-surface-elevated p-4 text-center space-y-3">
                <span className="text-[11px] font-mono text-foreground-muted uppercase">
                  Active Focus Session
                </span>
                <div className="font-mono text-3xl font-black text-white">
                  {formatDemoTime(demoSeconds)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setDemoRunning(!demoRunning)}
                    className="h-8 text-xs font-mono"
                  >
                    {demoRunning ? 'Pause' : 'Start Focus'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDemoRunning(false);
                      setDemoSeconds(1500);
                    }}
                    className="h-8 text-xs font-mono text-foreground-muted"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Mini Heatmap Demo */}
              <div className="md:col-span-2 rounded-lg border border-border bg-surface-elevated p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-foreground-muted uppercase">
                    365-Day Grayscale Heatmap
                  </span>
                  <span className="text-[10px] font-mono text-white">124 hours logged</span>
                </div>

                <div className="grid grid-cols-12 gap-1.5 pt-1">
                  {[
                    0, 1, 2, 4, 3, 2, 0, 1, 3, 4, 2, 1,
                    1, 2, 3, 4, 4, 3, 2, 0, 1, 2, 3, 4,
                    0, 0, 1, 2, 3, 4, 2, 1, 0, 3, 4, 2,
                    1, 2, 4, 3, 2, 1, 0, 2, 4, 3, 1, 4,
                  ].map((level, i) => (
                    <div
                      key={i}
                      className={`h-4 w-full rounded-sm border ${
                        level === 4
                          ? 'bg-contrib-4 border-white'
                          : level === 3
                          ? 'bg-contrib-3 border-neutral-400'
                          : level === 2
                          ? 'bg-contrib-2 border-neutral-600'
                          : level === 1
                          ? 'bg-contrib-1 border-neutral-700'
                          : 'bg-contrib-0 border-border/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-foreground-muted">
                  <span>Level 0 (0m)</span>
                  <span>Level 4 (120m+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="border-t border-border py-20 bg-surface/30">
        <div className="container mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
              Built for Developer Discipline
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary max-w-xl mx-auto">
              No bloated social feeds, no third-party vendor lock-in. Just pure, measurable learning momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-surface p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-white">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-white">
                Separate Tasks from Time
              </h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Checking off a to-do item is not the same as deep focus. DevLearn tracks actual elapsed study minutes for true progress calculation.
              </p>
            </Card>

            <Card className="border-border bg-surface p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-white">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-white">
                Dynamic &amp; Unconstrained
              </h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Create subjects tailored to your journey: Distributed Systems, LeetCode, Kernel Engineering, or Machine Learning.
              </p>
            </Card>

            <Card className="border-border bg-surface p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold font-mono text-white">
                Private &amp; Self-Contained
              </h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Your study habits are yours alone. Built with custom Argon2id authentication and server-side PostgreSQL persistence.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto max-w-4xl px-6 py-20 space-y-8">
        <h2 className="text-2xl font-bold font-mono text-white text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <Card className="border-border bg-surface p-5 space-y-1.5">
            <h3 className="text-sm font-semibold font-mono text-white">
              How are streaks calculated?
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Streaks are determined by active learning days (days with at least 1 minute of recorded study time in your configured timezone).
            </p>
          </Card>

          <Card className="border-border bg-surface p-5 space-y-1.5">
            <h3 className="text-sm font-semibold font-mono text-white">
              What if I close my browser during a focus session?
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              The live focus timer syncs with local storage timestamps, preserving your active duration when you reload or reopen the page.
            </p>
          </Card>

          <Card className="border-border bg-surface p-5 space-y-1.5">
            <h3 className="text-sm font-semibold font-mono text-white">
              Is DevLearn free to use?
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Yes, DevLearn is fully functional without paid third-party API dependencies or subscription gates.
            </p>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border py-16 text-center bg-surface-elevated/20">
        <div className="container mx-auto max-w-3xl px-6 space-y-6">
          <h2 className="text-3xl font-bold font-mono text-white">
            Start Quantifying Your Learning Today
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary max-w-lg mx-auto">
            Join developers mastering complex topics with measured consistency.
          </p>
          <div>
            <Link href="/register">
              <Button size="lg" className="gap-2 font-mono text-sm px-8">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs font-mono text-foreground-muted">
        <div className="container mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">DevLearn</span>
            <span>• Personal Learning SaaS</span>
          </div>
          <div>© {new Date().getFullYear()} DevLearn. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
