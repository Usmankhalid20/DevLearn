'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, History, Clock, Flame, CheckCircle2, Tag, Calendar } from 'lucide-react';

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'session' | 'history'>('dashboard');

  return (
    <section className="py-20 border-b border-border bg-surface/20">
      <div className="container mx-auto max-w-6xl px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">
            Interface Preview
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Quiet. Focused. Monochrome.
          </h2>
          <p className="text-sm text-foreground-secondary">
            Engineered without visual clutter or noisy gradients. Every pixel serves deliberate practice.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-foreground-secondary hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('session')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'session'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-foreground-secondary hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Learning Session
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-foreground-secondary hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              History Timeline
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <span className="text-xs font-mono text-foreground-secondary ml-3">
                app.devlearn.dev / {activeTab}
              </span>
            </div>
            <div className="text-xs font-mono text-foreground-muted">Connected • PostgreSQL</div>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Mock Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-surface p-4 space-y-1">
                    <span className="text-[11px] font-mono text-foreground-muted uppercase">
                      Today&apos;s Time
                    </span>
                    <div className="text-2xl font-mono font-bold text-white">4h 15m</div>
                    <span className="text-[10px] font-mono text-foreground-secondary">
                      Goal: 4h 00m (106%)
                    </span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-4 space-y-1">
                    <span className="text-[11px] font-mono text-foreground-muted uppercase">
                      Active Streak
                    </span>
                    <div className="text-2xl font-mono font-bold text-white">12 Days</div>
                    <span className="text-[10px] font-mono text-foreground-secondary">
                      Best: 28 Days
                    </span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-4 space-y-1">
                    <span className="text-[11px] font-mono text-foreground-muted uppercase">
                      Total Hours
                    </span>
                    <div className="text-2xl font-mono font-bold text-white">142.5h</div>
                    <span className="text-[10px] font-mono text-foreground-secondary">
                      Across 84 sessions
                    </span>
                  </div>
                </div>

                {/* Mock Recent Activity Row */}
                <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      Recent Activity
                    </span>
                    <span className="text-[10px] font-mono text-foreground-muted">Today</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="text-[10px]">
                          System Design
                        </Badge>
                        <span className="text-white font-medium">Distributed Consensus (Raft)</span>
                      </div>
                      <span className="text-foreground-secondary">1h 15m</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px]">
                          Database
                        </Badge>
                        <span className="text-white font-medium">PostgreSQL Index Internals</span>
                      </div>
                      <span className="text-foreground-secondary">45m</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'session' && (
              <div className="max-w-xl mx-auto rounded-lg border border-border bg-surface p-6 space-y-4 font-mono text-xs">
                <div className="border-b border-border pb-3">
                  <h4 className="text-sm font-bold text-white">Log Learning Session</h4>
                  <p className="text-foreground-secondary text-[11px]">
                    Minimal by default, detailed when needed.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-foreground-muted mb-1">Subject *</label>
                    <div className="rounded border border-border bg-background p-2 text-white">
                      Distributed Systems
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground-muted mb-1">Duration *</label>
                    <div className="rounded border border-border bg-background p-2 text-white">
                      45 minutes
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground-muted mb-1">
                      Topic / Concept (Optional)
                    </label>
                    <div className="rounded border border-border bg-background p-2 text-white">
                      Paxos vs Raft Leader Election
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground-muted mb-1">
                      Resource URL (Optional)
                    </label>
                    <div className="rounded border border-border bg-background p-2 text-foreground-secondary truncate">
                      https://raft.github.io/raft.pdf
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4 max-w-2xl mx-auto font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="font-bold text-white">Study Timeline</span>
                  <span className="text-foreground-muted">Total: 4 Sessions Today</span>
                </div>

                <div className="relative border-l border-border pl-6 space-y-6 ml-3">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-white" />
                    <div className="rounded-lg border border-border bg-surface p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Distributed Consensus</span>
                        <Badge variant="default" className="text-[10px]">
                          1h 15m
                        </Badge>
                      </div>
                      <p className="text-foreground-secondary text-[11px]">
                        Implemented Raft leader heartbeat timer in Go.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-neutral-600" />
                    <div className="rounded-lg border border-border bg-surface p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">SQL Optimization</span>
                        <Badge variant="outline" className="text-[10px]">
                          45m
                        </Badge>
                      </div>
                      <p className="text-foreground-secondary text-[11px]">
                        Analyzed EXPLAIN ANALYZE queries on multi-column B-Trees.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
