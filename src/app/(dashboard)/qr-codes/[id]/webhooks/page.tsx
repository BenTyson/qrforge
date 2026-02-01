'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { WebhookDeliveryLog } from '@/components/webhooks/WebhookDeliveryLog';
import type { WebhookDelivery } from '@/lib/webhooks/types';

interface WebhookConfigResponse {
  id: string;
  qr_code_id: string;
  url: string;
  is_active: boolean;
  events: string[];
  created_at: string;
  updated_at: string;
}

export default function WebhooksPage() {
  const router = useRouter();
  const params = useParams();
  const qrCodeId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeName, setQrCodeName] = useState('');
  const [config, setConfig] = useState<WebhookConfigResponse | null>(null);
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Delivery logs state
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [deliveryTotal, setDeliveryTotal] = useState(0);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Summary stats
  const [stats, setStats] = useState({ total: 0, successRate: 0, lastDelivery: '' });

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Verify tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profile?.subscription_tier !== 'business') {
        toast.error('Webhook notifications require a Business plan');
        router.push(`/qr-codes/${qrCodeId}`);
        return;
      }

      // Fetch QR code name
      const { data: qrCode } = await supabase
        .from('qr_codes')
        .select('name, user_id')
        .eq('id', qrCodeId)
        .eq('user_id', user.id)
        .single();

      if (!qrCode) {
        toast.error('QR code not found');
        router.push('/qr-codes');
        return;
      }

      setQrCodeName(qrCode.name);

      // Fetch webhook config
      const res = await fetch(`/api/qr/${qrCodeId}/webhook`);
      if (res.ok) {
        const data = await res.json();
        if (data.webhook) {
          setConfig(data.webhook);
          setUrl(data.webhook.url);
          setIsActive(data.webhook.is_active);
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [qrCodeId, router]);

  // Load deliveries
  const loadDeliveries = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(deliveryPage),
      limit: '20',
    });
    if (statusFilter) params.set('status', statusFilter);

    const res = await fetch(`/api/qr/${qrCodeId}/webhook/deliveries?${params}`);
    if (res.ok) {
      const data = await res.json();
      setDeliveries(data.deliveries);
      setDeliveryTotal(data.total);
    }
  }, [qrCodeId, deliveryPage, statusFilter]);

  // Load delivery stats
  const loadStats = useCallback(async () => {
    // Fetch all deliveries count and success count for stats
    const allRes = await fetch(`/api/qr/${qrCodeId}/webhook/deliveries?limit=1`);
    if (allRes.ok) {
      const allData = await allRes.json();
      const total = allData.total;

      const successRes = await fetch(`/api/qr/${qrCodeId}/webhook/deliveries?status=success&limit=1`);
      let successCount = 0;
      if (successRes.ok) {
        const successData = await successRes.json();
        successCount = successData.total;
      }

      const lastDelivery = allData.deliveries[0]?.created_at || '';

      setStats({
        total,
        successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
        lastDelivery,
      });
    }
  }, [qrCodeId]);

  useEffect(() => {
    if (!isLoading && config) {
      loadDeliveries();
      loadStats();
    }
  }, [isLoading, config, loadDeliveries, loadStats]);

  const handleSave = async () => {
    if (!url.trim()) {
      toast.error('Webhook URL is required');
      return;
    }

    if (!url.startsWith('https://')) {
      toast.error('Webhook URL must use HTTPS');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/qr/${qrCodeId}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, is_active: isActive }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save webhook');
        return;
      }

      setConfig(data.webhook);

      // Show secret on first creation
      if (data.secret) {
        setSecret(data.secret);
        setShowSecret(true);
        toast.success('Webhook created! Copy your signing secret — it won\'t be shown again.');
      } else {
        toast.success('Webhook updated');
      }
    } catch {
      toast.error('Failed to save webhook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(`/api/qr/${qrCodeId}/webhook/test`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Test webhook delivered (HTTP ${data.http_status})`);
      } else {
        toast.error(data.error_message || data.error || 'Test webhook failed');
      }

      // Refresh deliveries
      loadDeliveries();
      loadStats();
    } catch {
      toast.error('Failed to send test webhook');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the webhook? This will delete all delivery logs.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/qr/${qrCodeId}/webhook`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setConfig(null);
        setUrl('');
        setIsActive(true);
        setSecret(null);
        setDeliveries([]);
        setDeliveryTotal(0);
        toast.success('Webhook removed');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete webhook');
      }
    } catch {
      toast.error('Failed to delete webhook');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          Dashboard
        </Link>
        <span className="text-slate-600">/</span>
        <Link href="/qr-codes" className="text-slate-400 hover:text-white transition-colors">
          QR Codes
        </Link>
        <span className="text-slate-600">/</span>
        <Link href={`/qr-codes/${qrCodeId}`} className="text-slate-400 hover:text-white transition-colors">
          {qrCodeName || 'Details'}
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-white">Webhooks</span>
      </nav>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Webhook Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Receive HTTP POST callbacks when this QR code is scanned.
          </p>
        </div>

        {/* Configuration Card */}
        <Card className="p-6 glass">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Configuration</h2>
              {config && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="webhook-active" className="text-sm text-muted-foreground">Active</Label>
                  <Switch
                    id="webhook-active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="webhook-url" className="text-sm text-muted-foreground">
                Endpoint URL (HTTPS only)
              </Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-server.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 bg-secondary/50"
              />
            </div>

            {/* Secret display */}
            {secret && showSecret && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4">
                <p className="text-sm font-medium text-amber-400 mb-2">
                  Signing Secret (copy now — won&apos;t be shown again)
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-black/30 p-2 rounded font-mono break-all">
                    {secret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(secret);
                      toast.success('Secret copied to clipboard');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving || !url.trim()}>
                {isSaving ? 'Saving...' : config ? 'Update Webhook' : 'Create Webhook'}
              </Button>
              {config && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleTest}
                    disabled={isTesting}
                  >
                    {isTesting ? 'Sending...' : 'Send Test'}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-400 hover:text-red-300"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Removing...' : 'Remove'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        {config && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 glass text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Deliveries</p>
            </Card>
            <Card className="p-4 glass text-center">
              <p className="text-2xl font-bold">{stats.successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </Card>
            <Card className="p-4 glass text-center">
              <p className="text-2xl font-bold">
                {stats.lastDelivery ? new Date(stats.lastDelivery).toLocaleDateString() : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Last Delivery</p>
            </Card>
          </div>
        )}

        {/* Delivery Logs */}
        {config && (
          <div>
            <h2 className="font-semibold mb-4">Delivery Logs</h2>
            <WebhookDeliveryLog
              deliveries={deliveries}
              total={deliveryTotal}
              page={deliveryPage}
              limit={20}
              onPageChange={(p) => setDeliveryPage(p)}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => {
                setStatusFilter(s);
                setDeliveryPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
