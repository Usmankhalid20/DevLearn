import * as React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-white selection:text-black">
      {/* Marketing Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center space-x-2 font-mono font-bold text-white tracking-wider"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black text-xs font-black">
              DL
            </div>
            <span>DevLearn</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-mono text-foreground-secondary">
            <Link href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-mono text-foreground-secondary hover:text-white transition-colors px-2 py-1"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ size: 'sm', className: 'font-mono text-xs' })}
            >
              Start Tracking
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Marketing Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-foreground-muted font-mono bg-surface/40">
        <div className="container mx-auto max-w-6xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} DevLearn. Personal learning progress SaaS.</span>
          <div className="flex space-x-6 text-foreground-secondary text-[11px]">
            <span>Minimal Monochrome</span>
            <span>PostgreSQL &amp; Redis</span>
            <span>100% Private Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
