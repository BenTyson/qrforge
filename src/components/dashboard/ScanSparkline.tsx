'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ScanSparklineProps {
  data: { date: string; scans: number }[];
}

export function ScanSparkline({ data }: ScanSparklineProps) {
  if (data.length === 0 || data.every(d => d.scans === 0)) {
    return null;
  }

  return (
    <div className="w-[120px] h-[40px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="scans"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fill="url(#sparklineGradient)"
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
