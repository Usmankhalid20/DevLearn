'use client';

import * as React from 'react';
import { Play, Pause, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimerWidgetProps {
  onComplete: (durationMinutes: number) => void;
}

export function TimerWidget({ onComplete }: TimerWidgetProps) {
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);

  // Restore timer from localStorage if previously running
  React.useEffect(() => {
    const savedStartTime = localStorage.getItem('devlearn_timer_start');
    const savedElapsed = localStorage.getItem('devlearn_timer_elapsed');
    const savedIsActive = localStorage.getItem('devlearn_timer_active') === 'true';

    if (savedIsActive && savedStartTime) {
      const startMs = parseInt(savedStartTime, 10);
      const prevElapsed = parseInt(savedElapsed || '0', 10);
      const currentSeconds = prevElapsed + Math.floor((Date.now() - startMs) / 1000);
      setSeconds(currentSeconds);
      setIsActive(true);
    } else if (savedElapsed) {
      setSeconds(parseInt(savedElapsed, 10));
      setIsActive(false);
    }
  }, []);

  // Timer tick interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          localStorage.setItem('devlearn_timer_elapsed', String(next));
          return next;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
    localStorage.setItem('devlearn_timer_start', String(Date.now()));
    localStorage.setItem('devlearn_timer_active', 'true');
    localStorage.setItem('devlearn_timer_elapsed', String(seconds));
  };

  const handlePause = () => {
    setIsActive(false);
    localStorage.setItem('devlearn_timer_active', 'false');
    localStorage.setItem('devlearn_timer_elapsed', String(seconds));
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    localStorage.removeItem('devlearn_timer_start');
    localStorage.removeItem('devlearn_timer_elapsed');
    localStorage.removeItem('devlearn_timer_active');
  };

  const handleFinish = () => {
    const minutes = Math.max(1, Math.round(seconds / 60));
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
          Timer persists across tabs and window refreshes.
        </p>
      </CardContent>
    </Card>
  );
}
