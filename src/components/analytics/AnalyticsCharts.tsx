'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

type DateRange = '7d' | '30d' | 'all';

interface ScanData {
  scanned_at: string;
  device_type?: string;
  browser?: string;
  country?: string;
  city?: string;
}

interface AnalyticsChartsProps {
  scans: ScanData[];
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
}

// Chart colors - explicit values for dark theme compatibility
const CHART_COLORS = {
  primary: '#14b8a6', // teal-500 - brand color
  axis: '#94a3b8', // slate-400 - readable on dark bg
  grid: 'rgba(148, 163, 184, 0.2)', // subtle grid lines
  tooltip: {
    bg: '#1e293b', // slate-800
    border: '#334155', // slate-700
    text: '#f1f5f9', // slate-100
  },
};

const PIE_COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444'];

export function AnalyticsCharts({ scans, deviceBreakdown, browserBreakdown }: AnalyticsChartsProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  // Filter scans based on date range
  const filteredScans = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;

    switch (dateRange) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0);
        break;
    }

    return scans.filter(scan => new Date(scan.scanned_at) >= cutoffDate);
  }, [scans, dateRange]);

  // Group scans by day for line chart
  const scansByDay = useMemo(() => {
    const groupedData: Record<string, number> = {};
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;

    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      groupedData[key] = 0;
    }

    // Count scans per day
    filteredScans.forEach(scan => {
      const day = new Date(scan.scanned_at).toISOString().split('T')[0];
      if (groupedData[day] !== undefined) {
        groupedData[day]++;
      }
    });

    return Object.entries(groupedData)
      .map(([date, count]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        scans: count,
      }))
      .slice(-days);
  }, [filteredScans, dateRange]);

  // Transform device breakdown for pie chart
  const deviceData = useMemo(() => {
    return Object.entries(deviceBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [deviceBreakdown]);

  // Transform browser breakdown for bar chart
  const browserData = useMemo(() => {
    return Object.entries(browserBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({
        name,
        scans: value,
      }));
  }, [browserBreakdown]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'QR Code', 'Device', 'Browser', 'Country', 'City'];
    const rows = filteredScans.map(scan => [
      new Date(scan.scanned_at).toISOString(),
      '',
      scan.device_type || 'Unknown',
      scan.browser || 'Unknown',
      scan.country || 'Unknown',
      scan.city || 'Unknown',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Date Range Selector & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              dateRange === '7d'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              dateRange === '30d'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              dateRange === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Time
          </button>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <DownloadIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Scans Over Time - Line Chart */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <h3 className="font-semibold mb-6">Scans Over Time</h3>
        <div className="h-[300px]">
          {scansByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scansByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="label"
                  stroke={CHART_COLORS.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={dateRange === '7d' ? 0 : 'preserveStartEnd'}
                />
                <YAxis
                  stroke={CHART_COLORS.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_COLORS.tooltip.bg,
                    borderColor: CHART_COLORS.tooltip.border,
                    borderRadius: '8px',
                    color: CHART_COLORS.tooltip.text,
                  }}
                  labelStyle={{ color: CHART_COLORS.tooltip.text }}
                />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.primary, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: CHART_COLORS.primary }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No scan data available
            </div>
          )}
        </div>
      </div>

      {/* Device & Browser Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown - Pie Chart */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <h3 className="font-semibold mb-6">Device Distribution</h3>
          <div className="h-[280px]">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {deviceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHART_COLORS.tooltip.bg,
                      borderColor: CHART_COLORS.tooltip.border,
                      borderRadius: '8px',
                      color: CHART_COLORS.tooltip.text,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No device data available
              </div>
            )}
          </div>
        </div>

        {/* Browser Breakdown - Bar Chart */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur p-6">
          <h3 className="font-semibold mb-6">Top Browsers</h3>
          <div className="h-[280px]">
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke={CHART_COLORS.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={CHART_COLORS.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHART_COLORS.tooltip.bg,
                      borderColor: CHART_COLORS.tooltip.border,
                      borderRadius: '8px',
                      color: CHART_COLORS.tooltip.text,
                    }}
                  />
                  <Bar
                    dataKey="scans"
                    fill={CHART_COLORS.primary}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No browser data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
