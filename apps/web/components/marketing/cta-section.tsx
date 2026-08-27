import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <Card className="border-border bg-surface text-center p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <CardContent className="space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-mono text-foreground-secondary">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Get Started in Seconds</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight leading-tight">
              Start tracking your learning journey today.
            </h2>

            <p className="text-sm text-foreground-secondary leading-relaxed">
              Transform scattered tabs and study sessions into a clean record of time, completed work,
              and continuous engineering momentum.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/register">
                <Button size="lg" className="gap-2 font-mono text-sm">
                  Start Tracking Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/login">
                <Button variant="outline" size="lg" className="font-mono text-sm">
                  Log In to Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
