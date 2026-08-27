'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ActivityTrendChartProps {
  trendData: Array<{ date: string; minutes: number }>;
}

export function ActivityTrendChart({ trendData }: ActivityTrendChartProps) {
  return (
    <Card className="bg-surface border-border">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-mono text-base text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-white" />
              30-Day Activity Trend
            </CardTitle>
            <CardDescription className="text-xs font-mono text-foreground-secondary mt-1">
              Daily minutes spent across all study sessions.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#666666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#666666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit="m"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#151515',
                  borderColor: '#2A2A2A',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#FFFFFF',
                }}
                formatter={(value: any) => [`${value} minutes`, 'Focus Time']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#FFFFFF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMinutes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
