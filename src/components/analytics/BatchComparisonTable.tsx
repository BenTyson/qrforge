'use client';

export interface BatchComparisonRow {
  id: string;
  name: string;
  destinationUrl: string | null;
  scanCount: number;
  percentOfTotal: number;
  topDevice: string;
  topCountry: string;
}

interface BatchComparisonTableProps {
  rows: BatchComparisonRow[];
  batchLabel: string;
}

export function BatchComparisonTable({ rows, batchLabel }: BatchComparisonTableProps) {
  const handleExportCSV = () => {
    const headers = ['Rank', 'Name', 'URL', 'Scans', '% of Total', 'Top Device', 'Top Country'];
    const csvRows = rows.map((row, i) => [
      i + 1,
      `"${row.name.replace(/"/g, '""')}"`,
      `"${(row.destinationUrl || '').replace(/"/g, '""')}"`,
      row.scanCount,
      `${row.percentOfTotal.toFixed(1)}%`,
      row.topDevice,
      row.topCountry,
    ]);

    const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-report-${batchLabel.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-card/50 backdrop-blur p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <BatchTableIcon className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="font-semibold">Per-Code Comparison</h3>
        </div>
        <button
          onClick={handleExportCSV}
          className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors font-medium"
        >
          Export Batch Report
        </button>
      </div>

      {/* Mobile card layout */}
      <div className="sm:hidden space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="p-4 rounded-lg bg-secondary/20 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-secondary text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <a
                  href={`/analytics?qr=${row.id}`}
                  className="font-medium hover:text-amber-500 transition-colors truncate"
                >
                  {row.name}
                </a>
              </div>
              <span className="text-sm font-semibold">{row.scanCount.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <span className="text-xs uppercase tracking-wider">Share</span>
                <p>{row.percentOfTotal.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider">Top Device</span>
                <p className="capitalize">{row.topDevice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-3 font-medium w-12">#</th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">URL</th>
              <th className="pb-3 font-medium text-right">Scans</th>
              <th className="pb-3 font-medium text-right">% of Total</th>
              <th className="pb-3 font-medium">Top Device</th>
              <th className="pb-3 font-medium">Top Country</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.map((row, index) => (
              <tr key={row.id} className="group hover:bg-secondary/20 transition-colors">
                <td className="py-3">
                  <span className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3">
                  <a
                    href={`/analytics?qr=${row.id}`}
                    className="font-medium hover:text-amber-500 transition-colors"
                  >
                    {row.name}
                  </a>
                </td>
                <td className="py-3 text-muted-foreground max-w-[200px] truncate">
                  {row.destinationUrl || '-'}
                </td>
                <td className="py-3 text-right font-semibold">{row.scanCount.toLocaleString()}</td>
                <td className="py-3 text-right text-muted-foreground">{row.percentOfTotal.toFixed(1)}%</td>
                <td className="py-3 capitalize text-muted-foreground">{row.topDevice}</td>
                <td className="py-3 text-muted-foreground">{row.topCountry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatchTableIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
