import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Code2, Compass, Check } from 'lucide-react';
import { AUDIENCE_PERSONAS } from '@/lib/marketing-data';

const ICON_MAP = {
  GraduationCap,
  Code2,
  Compass,
};

export function AudienceSection() {
  return (
    <section className="py-20 border-b border-border">
      <div className="container mx-auto max-w-6xl px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">
            Who It&apos;s For
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Built for High-Focus Learners
          </h2>
          <p className="text-sm text-foreground-secondary">
            Whether preparing for interviews, leveling up as an engineer, or tackling university coursework.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIENCE_PERSONAS.map((item) => {
            const Icon = ICON_MAP[item.iconName] || Code2;

            return (
              <Card key={item.role} className="border-border bg-surface hover:border-neutral-700 transition-colors">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-mono text-white">{item.role}</h3>
                      <p className="text-[11px] text-foreground-secondary">{item.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <span className="text-[11px] font-mono text-foreground-muted uppercase">
                      Answers questions like:
                    </span>
                    <ul className="space-y-2 text-xs font-mono text-foreground-secondary">
                      {item.questions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-white shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
