import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WORKFLOW_STEPS } from '@/lib/marketing-data';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 border-b border-border">
      <div className="container mx-auto max-w-6xl px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">
            Core Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            How DevLearn Works
          </h2>
          <p className="text-sm text-foreground-secondary">
            A frictionless loop designed for daily engineering practice and deep focus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKFLOW_STEPS.map((step) => (
            <Card key={step.number} className="border-border bg-surface hover:border-neutral-700 transition-colors">
              <CardContent className="p-6 space-y-4">
                <span className="text-2xl font-black font-mono text-foreground-muted block">
                  {step.number}
                </span>
                <h3 className="text-base font-bold font-mono text-white">{step.title}</h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {step.description}
                </p>
                <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-foreground-muted">
                  {step.details}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
