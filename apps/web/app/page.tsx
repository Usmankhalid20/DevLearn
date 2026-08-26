import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  Layers,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center space-x-2.5 font-mono font-bold text-white tracking-wider">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black text-xs font-black">
              DL
            </div>
            <span>DevLearn</span>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="font-mono text-[11px]">
              Phase 01 — Foundation
            </Badge>
            <Link
              href="https://github.com"
              target="_blank"
              className="text-xs font-mono text-foreground-secondary hover:text-white transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 py-12 px-6 md:py-20">
        <div className="container mx-auto max-w-6xl space-y-16">
          {/* Hero Header */}
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1 text-xs font-mono text-foreground-secondary">
              <span className="flex h-2 w-2 rounded-full bg-white" />
              Minimal Monochrome Architecture Active
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl font-mono">
              Track what you learn. Measure your time. See your progress.
            </h1>
            <p className="text-base text-foreground-secondary leading-relaxed sm:text-lg">
              DevLearn turns scattered learning activity across documentation, videos, courses,
              and code into a measurable, verifiable learning history with custom grayscale activity heatmaps.
            </p>
          </div>

          {/* Design System Token Showcase */}
          <div className="space-y-6">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Design System Foundation & Tokens
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Monochrome palette, tonal surfaces, and grayscale contribution levels (Level 0–4).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Token Surfaces */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase font-mono tracking-wider text-foreground-muted">
                    Surfaces & Depth
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Clean tonal contrast without bright branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 rounded border border-border bg-background flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground-secondary">--bg-base</span>
                    <span className="text-white">#0D0D0D</span>
                  </div>
                  <div className="p-3 rounded border border-border bg-surface flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground-secondary">--bg-surface</span>
                    <span className="text-white">#151515</span>
                  </div>
                  <div className="p-3 rounded border border-border bg-surface-elevated flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground-secondary">--bg-surface-elevated</span>
                    <span className="text-white">#1C1C1C</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contribution Grayscale Heatmap */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase font-mono tracking-wider text-foreground-muted">
                    Contribution Heatmap
                  </CardTitle>
                  <CardDescription className="text-xs">
                    GitHub-style learning activity scale in grayscale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-sm bg-contrib-0 border border-border" title="Level 0: #1A1A1A" />
                    <div className="h-5 w-5 rounded-sm bg-contrib-1 border border-border" title="Level 1: #303030" />
                    <div className="h-5 w-5 rounded-sm bg-contrib-2 border border-border" title="Level 2: #555555" />
                    <div className="h-5 w-5 rounded-sm bg-contrib-3 border border-border" title="Level 3: #858585" />
                    <div className="h-5 w-5 rounded-sm bg-contrib-4 border border-border" title="Level 4: #FFFFFF" />
                  </div>
                  <div className="text-[11px] font-mono text-foreground-secondary flex justify-between">
                    <span>Less (0m)</span>
                    <span>More (120m+)</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const level = (i % 5) as 0 | 1 | 2 | 3 | 4;
                      const levelClass =
                        level === 0
                          ? 'bg-contrib-0'
                          : level === 1
                          ? 'bg-contrib-1'
                          : level === 2
                          ? 'bg-contrib-2'
                          : level === 3
                          ? 'bg-contrib-3'
                          : 'bg-contrib-4';
                      return (
                        <div
                          key={i}
                          className={`h-4 w-full rounded-sm border border-border/40 ${levelClass}`}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* UI Primitives */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase font-mono tracking-wider text-foreground-muted">
                    UI Primitives & States
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Button variants, badges, and semantic states
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="default">Primary</Button>
                    <Button size="sm" variant="secondary">Secondary</Button>
                    <Button size="sm" variant="outline">Outline</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="secondary">Monochrome</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Foundation Architecture Status */}
          <div className="space-y-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Phase 01 Verification Matrix
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-surface">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-mono flex items-center gap-2 text-white">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Frontend (Next.js)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-foreground-secondary space-y-1">
                  <p>• App Router & layout groups configured</p>
                  <p>• Tailwind CSS tokens active</p>
                  <p>• shadcn/ui base primitives ready</p>
                  <p>• Lucide icon system configured</p>
                </CardContent>
              </Card>

              <Card className="bg-surface">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-mono flex items-center gap-2 text-white">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Backend API (Express)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-foreground-secondary space-y-1">
                  <p>• Security middleware (Helmet, CORS, Cookies)</p>
                  <p>• Structured logging (Pino)</p>
                  <p>• Centralized error handler</p>
                  <p>• Health status endpoint (/health)</p>
                </CardContent>
              </Card>

              <Card className="bg-surface">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-mono flex items-center gap-2 text-white">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Local Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-foreground-secondary space-y-1">
                  <p>• Docker Compose (PostgreSQL 16 + Redis 7)</p>
                  <p>• Prisma client foundation</p>
                  <p>• Redis connection manager</p>
                  <p>• Environment schema validation (Zod)</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-foreground-muted font-mono">
        <div className="container mx-auto max-w-6xl px-6 flex justify-between items-center">
          <span>DevLearn Foundation v0.1.0</span>
          <span>Next: Phase 02 Data Model & Auth</span>
        </div>
      </footer>
    </div>
  );
}
