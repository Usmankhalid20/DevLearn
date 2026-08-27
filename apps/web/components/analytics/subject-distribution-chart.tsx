import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers } from 'lucide-react';

interface SubjectDistributionChartProps {
  subjectData: Array<{
    name: string;
    minutes: number;
    percentage: number;
  }>;
}

export function SubjectDistributionChart({ subjectData }: SubjectDistributionChartProps) {
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <Card className="bg-surface border-border">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="font-mono text-base text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-white" />
          Skill Distribution
        </CardTitle>
        <CardDescription className="text-xs font-mono text-foreground-secondary mt-1">
          Relative percentage of learning time allocated per subject.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-4">
        {subjectData.length === 0 ? (
          <div className="py-12 text-center font-mono text-xs text-foreground-muted">
            No subject distribution data available yet.
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            {subjectData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-foreground-secondary">
                    {formatDuration(item.minutes)} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-border">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
