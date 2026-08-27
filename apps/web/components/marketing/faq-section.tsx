'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '@/lib/marketing-data';

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 border-b border-border bg-surface/20">
      <div className="container mx-auto max-w-4xl px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono text-foreground-secondary uppercase tracking-widest">
            Common Inquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-foreground-secondary">
            Everything you need to know about DevLearn&apos;s product philosophy and architecture.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <Card
                key={idx}
                className="border-border bg-surface overflow-hidden transition-colors hover:border-neutral-700"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-mono text-sm font-semibold text-white focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-foreground-secondary shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <CardContent className="px-5 pb-5 pt-0 text-xs font-mono text-foreground-secondary leading-relaxed border-t border-border/40 mt-1 pt-3">
                    {item.answer}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
