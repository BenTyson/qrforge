'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getFeedbackResponseLimit } from '@/lib/stripe/plans';
import type { SubscriptionTier } from '@/lib/stripe/plans';

interface FeedbackResponse {
  id: string;
  rating: number;
  comment: string | null;
  email: string | null;
  created_at: string;
}

interface FeedbackDashboardProps {
  qrCodeId: string;
  userTier: SubscriptionTier;
}

export function FeedbackDashboard({ qrCodeId, userTier }: FeedbackDashboardProps) {
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 20;

  // Fetch responses and monthly count
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const supabase = createClient();
      const from = page * pageSize;
      const to = from + pageSize - 1;

      // Fetch paginated responses
      const { data, error, count } = await supabase
        .from('feedback_responses')
        .select('id, rating, comment, email, created_at', { count: 'exact' })
        .eq('qr_code_id', qrCodeId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (cancelled) return;

      if (error) {
        console.error('Error fetching feedback:', error);
        setLoading(false);
        return;
      }

      setResponses(data || []);
      setTotalCount(count || 0);
      setHasMore((count || 0) > (page + 1) * pageSize);

      // Fetch monthly count
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count: mCount } = await supabase
        .from('feedback_responses')
        .select('id', { count: 'exact', head: true })
        .eq('qr_code_id', qrCodeId)
        .gte('created_at', monthStart.toISOString());

      if (cancelled) return;
      setMonthlyCount(mCount || 0);
      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [qrCodeId, page]);

  const avgRating = totalCount > 0
    ? responses.reduce((sum, r) => sum + r.rating, 0) / Math.min(responses.length, totalCount)
    : 0;

  const limit = getFeedbackResponseLimit(userTier);
  const limitDisplay = limit === -1 ? 'Unlimited' : `${monthlyCount} / ${limit}`;

  // Rating distribution
  const distribution = [0, 0, 0, 0, 0];
  responses.forEach((r) => { distribution[r.rating - 1]++; });
  const maxDist = Math.max(...distribution, 1);

  const latestResponse = responses.length > 0 ? responses[0] : null;

  // Capture current time once per data load to avoid impure render calls
  const [now] = useState(() => Date.now());
  const relativeTime = useMemo(() => {
    return (date: string) => {
      const diff = now - new Date(date).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days}d ago`;
      return new Date(date).toLocaleDateString();
    };
  }, [now]);

  const handleExportCSV = () => {
    if (userTier !== 'business') return;

    const headers = ['Date', 'Rating', 'Comment', 'Email'];
    const rows = responses.map((r) => [
      new Date(r.created_at).toISOString(),
      String(r.rating),
      r.comment ? `"${r.comment.replace(/"/g, '""')}"` : '',
      r.email || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${qrCodeId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 glass">
            <div className="h-20 bg-secondary/50 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="p-12 glass text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
        <p className="text-muted-foreground">Share your QR code to start collecting responses.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 glass">
          <p className="text-xs text-muted-foreground mb-1">Total Responses</p>
          <p className="text-2xl font-bold">{totalCount}</p>
        </Card>
        <Card className="p-4 glass">
          <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
          <p className="text-2xl font-bold flex items-center gap-1">
            {avgRating.toFixed(1)}
            <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </p>
        </Card>
        <Card className="p-4 glass">
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p className="text-2xl font-bold">{limitDisplay}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            userTier === 'business' ? 'bg-violet-500/20 text-violet-400' :
            userTier === 'pro' ? 'bg-blue-500/20 text-blue-400' :
            'bg-zinc-500/20 text-zinc-400'
          }`}>
            {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
          </span>
        </Card>
        <Card className="p-4 glass">
          <p className="text-xs text-muted-foreground mb-1">Latest Response</p>
          <p className="text-2xl font-bold">{latestResponse ? relativeTime(latestResponse.created_at) : '--'}</p>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="p-6 glass">
        <h3 className="text-sm font-medium mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star - 1];
            const pct = totalCount > 0 ? Math.round((count / responses.length) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-4">{star}</span>
                <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="flex-1 h-3 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(count / maxDist) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        {userTier === 'business' ? (
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </Button>
        ) : (
          <Link href="/plans">
            <Button variant="outline" size="sm" className="opacity-70">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">Business</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Responses List */}
      <Card className="glass divide-y divide-border/30">
        <div className="p-4">
          <h3 className="text-sm font-medium">Responses</h3>
        </div>
        {responses.map((r) => (
          <div key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill={s <= r.rating ? '#f59e0b' : 'none'}
                        stroke={s <= r.rating ? '#f59e0b' : '#71717a'}
                        strokeWidth="1.5"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  {r.email && (
                    <span className="text-xs text-muted-foreground truncate">{r.email}</span>
                  )}
                </div>
                {r.comment && (
                  <p className="text-sm text-foreground/80">{r.comment}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </Card>

      {/* Pagination */}
      {(page > 0 || hasMore) && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
