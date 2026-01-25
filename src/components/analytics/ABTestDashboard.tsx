'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  calculateSignificance,
  formatConfidence,
  formatImprovement,
} from '@/lib/ab-testing/statistics';
import type { ABTest, ABVariant, ABTestStatistics } from '@/lib/ab-testing/types';

interface ABTestDashboardProps {
  qrCodeId: string;
  qrCodeName: string;
}

interface ABTestWithVariants extends ABTest {
  ab_variants: ABVariant[];
}

export function ABTestDashboard({ qrCodeId, qrCodeName }: ABTestDashboardProps) {
  const [test, setTest] = useState<ABTestWithVariants | null>(null);
  const [stats, setStats] = useState<ABTestStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTest();
  }, [qrCodeId]);

  async function loadTest() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ab_tests')
        .select(`
          *,
          ab_variants (*)
        `)
        .eq('qr_code_id', qrCodeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading A/B test:', error);
        return;
      }

      if (data) {
        setTest(data as ABTestWithVariants);

        // Calculate statistics
        const variants = data.ab_variants as ABVariant[];
        if (variants.length >= 2) {
          const control = variants.find(v => v.slug === 'a');
          const variantB = variants.find(v => v.slug === 'b');
          if (control && variantB) {
            const statistics = calculateSignificance(
              control.scan_count,
              variantB.scan_count,
              data.target_confidence
            );
            setStats(statistics);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateTestStatus(status: 'running' | 'paused' | 'completed') {
    if (!test) return;

    setUpdating(true);
    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = { status };

      if (status === 'running' && !test.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ab_tests')
        .update(updateData)
        .eq('id', test.id);

      if (error) {
        console.error('Error updating test status:', error);
        return;
      }

      await loadTest();
    } finally {
      setUpdating(false);
    }
  }

  async function declareWinner(variantId: string) {
    if (!test) return;

    setUpdating(true);
    try {
      const supabase = createClient();
      const winningVariant = test.ab_variants.find(v => v.id === variantId);

      // Update test with winner
      const { error: testError } = await supabase
        .from('ab_tests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          winner_variant_id: variantId,
        })
        .eq('id', test.id);

      if (testError) {
        console.error('Error declaring winner:', testError);
        return;
      }

      // Update QR code destination URL to winner's URL
      if (winningVariant) {
        const { error: qrError } = await supabase
          .from('qr_codes')
          .update({ destination_url: winningVariant.destination_url })
          .eq('id', qrCodeId);

        if (qrError) {
          console.error('Error updating QR code URL:', qrError);
        }
      }

      await loadTest();
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-slate-400 mt-2">Loading A/B test data...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-6 text-center border border-slate-700 rounded-xl bg-slate-800/50">
        <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 3h5v5" />
          <path d="M8 3H3v5" />
          <path d="M21 3l-7 7" />
          <path d="M3 3l7 7" />
          <path d="M21 14v7h-5" />
          <path d="M3 14v7h5" />
          <path d="M14 21l7-7" />
          <path d="M10 21l-7-7" />
        </svg>
        <h3 className="font-semibold text-white mb-1">No A/B Test</h3>
        <p className="text-sm text-slate-400">
          Enable A/B testing when creating or editing this QR code to compare destinations.
        </p>
      </div>
    );
  }

  const control = test.ab_variants.find(v => v.slug === 'a');
  const variantB = test.ab_variants.find(v => v.slug === 'b');
  const totalScans = (control?.scan_count || 0) + (variantB?.scan_count || 0);
  const isCompleted = test.status === 'completed';
  const winnerVariant = test.winner_variant_id
    ? test.ab_variants.find(v => v.id === test.winner_variant_id)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">A/B Test Results</h2>
          <p className="text-sm text-slate-400">{qrCodeName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            test.status === 'running' && 'bg-green-500/20 text-green-400',
            test.status === 'paused' && 'bg-yellow-500/20 text-yellow-400',
            test.status === 'completed' && 'bg-blue-500/20 text-blue-400',
            test.status === 'draft' && 'bg-slate-500/20 text-slate-400',
          )}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Winner Banner */}
      {isCompleted && winnerVariant && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-400">Winner: {winnerVariant.name}</p>
              <p className="text-sm text-slate-300 truncate max-w-md">{winnerVariant.destination_url}</p>
            </div>
          </div>
        </div>
      )}

      {/* Variant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Variant A (Control) */}
        {control && (
          <div className={cn(
            'p-4 rounded-xl border',
            winnerVariant?.id === control.id
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-teal-500/30 bg-teal-500/5'
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
                  A
                </span>
                <span className="font-semibold text-white">{control.name}</span>
              </div>
              <span className="text-xs text-slate-400">{control.weight}% traffic</span>
            </div>
            <p className="text-sm text-slate-400 truncate mb-4">{control.destination_url}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{control.scan_count.toLocaleString()}</span>
              <span className="text-sm text-slate-400">scans</span>
            </div>
            {totalScans > 0 && (
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${(control.scan_count / totalScans) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Variant B */}
        {variantB && (
          <div className={cn(
            'p-4 rounded-xl border',
            winnerVariant?.id === variantB.id
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-purple-500/30 bg-purple-500/5'
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                  B
                </span>
                <span className="font-semibold text-white">{variantB.name}</span>
              </div>
              <span className="text-xs text-slate-400">{variantB.weight}% traffic</span>
            </div>
            <p className="text-sm text-slate-400 truncate mb-4">{variantB.destination_url}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{variantB.scan_count.toLocaleString()}</span>
              <span className="text-sm text-slate-400">scans</span>
              {stats && control && control.scan_count > 0 && (
                <span className={cn(
                  'text-sm font-medium',
                  stats.improvement > 0 ? 'text-green-400' : stats.improvement < 0 ? 'text-red-400' : 'text-slate-400'
                )}>
                  {formatImprovement(stats.improvement)} vs Control
                </span>
              )}
            </div>
            {totalScans > 0 && (
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(variantB.scan_count / totalScans) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistical Significance */}
      {stats && !isCompleted && (
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Statistical Confidence</h3>
            <span className={cn(
              'text-sm font-medium',
              stats.isSignificant ? 'text-green-400' : 'text-yellow-400'
            )}>
              {formatConfidence(stats.confidence)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-700 overflow-hidden mb-2">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                stats.confidence >= 0.95 ? 'bg-green-500' :
                stats.confidence >= 0.8 ? 'bg-yellow-500' : 'bg-slate-500'
              )}
              style={{ width: `${Math.min(100, stats.confidence * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span className="text-yellow-400">80%</span>
            <span className="text-green-400">95% target</span>
            <span>100%</span>
          </div>
          {!stats.isSignificant && stats.scansNeeded > 0 && (
            <p className="text-sm text-slate-400 mt-3">
              Approximately {stats.scansNeeded.toLocaleString()} more scans needed for 95% confidence.
            </p>
          )}
          {stats.isSignificant && (
            <p className="text-sm text-green-400 mt-3">
              Results are statistically significant. You can declare a winner.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="flex flex-wrap gap-3">
          {test.status === 'running' && (
            <Button
              variant="outline"
              onClick={() => updateTestStatus('paused')}
              disabled={updating}
            >
              Pause Test
            </Button>
          )}
          {test.status === 'paused' && (
            <Button
              onClick={() => updateTestStatus('running')}
              disabled={updating}
            >
              Resume Test
            </Button>
          )}
          {test.status === 'draft' && (
            <Button
              onClick={() => updateTestStatus('running')}
              disabled={updating}
            >
              Start Test
            </Button>
          )}
          {stats?.isSignificant && control && variantB && (
            <>
              <Button
                variant="outline"
                className="border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
                onClick={() => declareWinner(control.id)}
                disabled={updating}
              >
                Declare A as Winner
              </Button>
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                onClick={() => declareWinner(variantB.id)}
                disabled={updating}
              >
                Declare B as Winner
              </Button>
            </>
          )}
        </div>
      )}

      {/* Test Info */}
      <div className="text-xs text-slate-500 flex flex-wrap gap-4">
        <span>Created: {new Date(test.created_at).toLocaleDateString()}</span>
        {test.started_at && <span>Started: {new Date(test.started_at).toLocaleDateString()}</span>}
        {test.completed_at && <span>Completed: {new Date(test.completed_at).toLocaleDateString()}</span>}
        <span>Total scans: {totalScans.toLocaleString()}</span>
      </div>
    </div>
  );
}
