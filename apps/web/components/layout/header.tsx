import * as React from 'react';
import { User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ title = 'Dashboard' }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <h1 className="text-sm font-semibold tracking-tight text-white font-mono">{title}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground-secondary">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="h-4 w-[1px] bg-border" />

        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated border border-border text-foreground text-xs font-mono">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs text-foreground-secondary hidden sm:inline-block font-mono">
            user@devlearn.io
          </span>
        </div>
      </div>
    </header>
  );
}
