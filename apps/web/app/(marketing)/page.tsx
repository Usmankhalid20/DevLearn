import * as React from 'react';
import { HeroSection } from '@/components/marketing/hero-section';
import { ProblemSolutionSection } from '@/components/marketing/problem-solution-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { ProductPreviewSection } from '@/components/marketing/product-preview-section';
import { ContributionSection } from '@/components/marketing/contribution-section';
import { AnalyticsSection } from '@/components/marketing/analytics-section';
import { AudienceSection } from '@/components/marketing/audience-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { CtaSection } from '@/components/marketing/cta-section';

export const metadata = {
  title: 'DevLearn — Track what you learn. See your progress.',
  description:
    'A personal learning progress SaaS for students, developers, and self-learners. Track time, manage tasks, and visualize consistency with a dark monochrome activity heatmap.',
};

export default function MarketingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ProblemSolutionSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <ContributionSection />
      <AnalyticsSection />
      <AudienceSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
