import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { APIKeyManager } from '@/components/developers/APIKeyManager';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function DevelopersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get profile to check tier
  const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';

  // If not business tier, show upgrade prompt
  if (tier !== 'business') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">API Access</h1>
          <p className="text-muted-foreground mt-1">
            Build integrations with the QRWolf API
          </p>
        </div>

        <Card className="p-8 glass text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CodeIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unlock API Access</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Programmatically create, manage, and generate QR codes with our REST API.
            Available exclusively on the Business plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/#pricing">Upgrade to Business</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/developers/docs">View Documentation</Link>
            </Button>
          </div>
        </Card>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="p-6 glass">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
              <ZapIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold mb-1">Create QR Codes</h3>
            <p className="text-sm text-muted-foreground">
              Generate QR codes programmatically with full styling control
            </p>
          </Card>
          <Card className="p-6 glass">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
              <ImageIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-1">Image Generation</h3>
            <p className="text-sm text-muted-foreground">
              Get PNG or SVG images via API with custom sizes
            </p>
          </Card>
          <Card className="p-6 glass">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <ChartIcon className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track scans and usage with real-time analytics
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Get API key stats
  const { data: apiKeys } = await serviceClient
    .from('api_keys')
    .select('id, name, key_prefix, environment, request_count, monthly_request_count, last_used_at, created_at, revoked_at')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  const totalRequests = apiKeys?.reduce((sum, key) => sum + (key.request_count || 0), 0) || 0;
  const monthlyRequests = apiKeys?.reduce((sum, key) => sum + (key.monthly_request_count || 0), 0) || 0;
  const activeKeys = apiKeys?.length || 0;
  const monthlyLimit = 10000;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">API</h1>
          <p className="text-muted-foreground mt-1">
            Build integrations with the QRWolf API
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/developers/docs">
            <BookIcon className="w-4 h-4 mr-2" />
            Documentation
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 glass">
          <p className="text-sm text-muted-foreground mb-1">Monthly Requests</p>
          <p className="text-2xl font-bold">{monthlyRequests.toLocaleString()}</p>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min((monthlyRequests / monthlyLimit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {((monthlyRequests / monthlyLimit) * 100).toFixed(1)}% of {monthlyLimit.toLocaleString()} limit
          </p>
        </Card>
        <Card className="p-6 glass">
          <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
          <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">All-time API usage</p>
        </Card>
        <Card className="p-6 glass">
          <p className="text-sm text-muted-foreground mb-1">Active Keys</p>
          <p className="text-2xl font-bold">{activeKeys}</p>
          <p className="text-xs text-muted-foreground mt-2">of 5 maximum</p>
        </Card>
      </div>

      {/* API Key Manager */}
      <APIKeyManager initialKeys={apiKeys || []} />

      {/* Quick Reference */}
      <Card className="p-6 glass mt-6">
        <h2 className="font-semibold mb-4">Quick Reference</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Base URL</p>
            <code className="bg-secondary/50 px-2 py-1 rounded text-xs">
              https://qrwolf.com/api/v1
            </code>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Authentication</p>
            <code className="bg-secondary/50 px-2 py-1 rounded text-xs">
              Authorization: Bearer your_api_key
            </code>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Key Endpoints</p>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">GET</span>
                <code className="text-xs">/qr-codes</code>
                <span className="text-xs text-muted-foreground">- List QR codes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">POST</span>
                <code className="text-xs">/qr-codes</code>
                <span className="text-xs text-muted-foreground">- Create QR code</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">GET</span>
                <code className="text-xs">/qr-codes/:id/image</code>
                <span className="text-xs text-muted-foreground">- Get QR image</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Documentation Link */}
        <div className="mt-6 pt-4 border-t border-border">
          <Link
            href="/developers/docs"
            className="flex items-center justify-between p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-primary">View Full Documentation</p>
                <p className="text-sm text-muted-foreground">Code examples, parameters, and response formats</p>
              </div>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
