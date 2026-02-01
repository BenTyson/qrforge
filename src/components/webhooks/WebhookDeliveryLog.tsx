'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WebhookDelivery } from '@/lib/webhooks/types';

interface WebhookDeliveryLogProps {
  deliveries: WebhookDelivery[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-orange-500/20 text-orange-400',
  exhausted: 'bg-red-500/20 text-red-400',
};

const STATUS_TABS = [
  { label: 'All', value: null },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Exhausted', value: 'exhausted' },
];

export function WebhookDeliveryLog({
  deliveries,
  total,
  page,
  limit,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
}: WebhookDeliveryLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onStatusFilterChange(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deliveries list */}
      {deliveries.length === 0 ? (
        <Card className="p-8 glass text-center">
          <p className="text-muted-foreground">No webhook deliveries found</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="glass overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === delivery.id ? null : delivery.id)}
                className="w-full p-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLES[delivery.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {delivery.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(delivery.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {delivery.http_status && (
                      <span>HTTP {delivery.http_status}</span>
                    )}
                    <span>Attempt {delivery.attempt_number}/{delivery.max_attempts}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedId === delivery.id ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {delivery.error_message && (
                  <p className="text-xs text-red-400 mt-1 truncate">{delivery.error_message}</p>
                )}
              </button>

              {expandedId === delivery.id && (
                <div className="border-t border-border/50 p-4 space-y-3 bg-secondary/10">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Delivery ID</p>
                    <p className="text-xs font-mono">{delivery.id}</p>
                  </div>

                  {delivery.payload && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Payload</p>
                      <pre className="text-xs bg-black/30 p-3 rounded-md overflow-x-auto max-h-48">
                        {JSON.stringify(delivery.payload, null, 2)}
                      </pre>
                    </div>
                  )}

                  {delivery.response_body && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                      <pre className="text-xs bg-black/30 p-3 rounded-md overflow-x-auto max-h-32">
                        {delivery.response_body}
                      </pre>
                    </div>
                  )}

                  {delivery.error_message && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Error</p>
                      <p className="text-xs text-red-400">{delivery.error_message}</p>
                    </div>
                  )}

                  {delivery.delivered_at && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Delivered At</p>
                      <p className="text-xs">{new Date(delivery.delivered_at).toLocaleString()}</p>
                    </div>
                  )}

                  {delivery.next_retry_at && delivery.status === 'failed' && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Next Retry</p>
                      <p className="text-xs">{new Date(delivery.next_retry_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
