import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Marketing Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2 font-mono font-bold text-white tracking-wider">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black text-xs font-black">
              DL
            </div>
            <span>DevLearn</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-foreground-secondary hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Marketing Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-foreground-muted font-mono">
        <div className="container mx-auto max-w-6xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} DevLearn. Spec-driven learning progress tracking.</span>
          <div className="flex space-x-6 text-foreground-secondary">
            <span>Minimal Monochrome Architecture</span>
            <span>Local & SaaS Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
