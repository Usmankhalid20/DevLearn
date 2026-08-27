'use client';

import * as React from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimerWidgetProps {
  onComplete: (durationMinutes: number) => void;
}

export function TimerWidget({ onComplete }: TimerWidgetProps) {
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);

  const calculateCurrentSeconds = React.useCallback(() => {
    const savedStartTime = localStorage.getItem('devlearn_timer_start');
    const savedElapsed = parseInt(localStorage.getItem('devlearn_timer_elapsed') || '0', 10);
    const savedIsActive = localStorage.getItem('devlearn_timer_active') === 'true';

    if (savedIsActive && savedStartTime) {
      const startMs = parseInt(savedStartTime, 10);
      const segmentSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      return { total: savedElapsed + segmentSeconds, active: true };
    }

    return { total: savedElapsed, active: false };
  }, []);

  // Restore and sync timer state
  React.useEffect(() => {
    const syncFromStorage = () => {
      const { total, active } = calculateCurrentSeconds();
      setSeconds(total);
      setIsActive(active);
    };

    syncFromStorage();

    // Sync across browser tabs
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'devlearn_timer_start' ||
        e.key === 'devlearn_timer_elapsed' ||
        e.key === 'devlearn_timer_active'
      ) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [calculateCurrentSeconds]);

  // Timer interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        const { total } = calculateCurrentSeconds();
        setSeconds(total);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, calculateCurrentSeconds]);

  const handleStart = () => {
    const now = Date.now();
    localStorage.setItem('devlearn_timer_start', String(now));
    localStorage.setItem('devlearn_timer_active', 'true');
    setIsActive(true);
  };

  const handlePause = () => {
    const { total } = calculateCurrentSeconds();
    setIsActive(false);
    localStorage.setItem('devlearn_timer_active', 'false');
    localStorage.setItem('devlearn_timer_elapsed', String(total));
    localStorage.removeItem('devlearn_timer_start');
    setSeconds(total);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    localStorage.removeItem('devlearn_timer_start');
    localStorage.removeItem('devlearn_timer_elapsed');
    localStorage.removeItem('devlearn_timer_active');
  };

  const handleFinish = () => {
    const { total } = calculateCurrentSeconds();
    const minutes = Math.max(1, Math.round(total / 60));
    handleReset();
    onComplete(minutes);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="border-border bg-surface text-foreground shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground-muted">
            Focus Session Timer
          </CardTitle>
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className="font-mono text-[10px]"
          >
            {isActive ? 'Tracking Active' : seconds > 0 ? 'Paused' : 'Ready'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4 text-center">
        {/* Time display */}
        <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white select-none">
          {formatTime(seconds)}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isActive ? (
            <Button onClick={handleStart} className="gap-2 px-6">
              <Play className="h-4 w-4 fill-black" />
              {seconds > 0 ? 'Resume' : 'Start Focus'}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="secondary" className="gap-2 px-6">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}

          {seconds > 0 && (
            <>
              <Button onClick={handleFinish} variant="default" className="gap-1.5 bg-white text-black font-semibold">
                <Check className="h-4 w-4" />
                Log Session
              </Button>
              <Button onClick={handleReset} variant="outline" size="icon" title="Reset Timer">
                <RotateCcw className="h-4 w-4 text-foreground-secondary" />
              </Button>
            </>
          )}
        </div>

        <p className="text-[11px] text-foreground-muted font-mono">
          Timer synchronizes across tabs and persists through page reloads.
        </p>
      </CardContent>
    </Card>
  );
}
