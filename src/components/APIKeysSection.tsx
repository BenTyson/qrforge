'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

interface APIKeysSectionProps {
  tier: 'free' | 'pro' | 'business';
}

export function APIKeysSection({ tier }: APIKeysSectionProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    if (tier === 'business') {
      fetchKeys();
    } else {
      setIsLoading(false);
    }
  }, [tier]);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys.filter((k: ApiKey) => !k.revoked_at));
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create API key');
      }

      const data = await res.json();
      setNewKey(data.key);
      setKeys([{ ...data, key: undefined }, ...keys]);
      setNewKeyName('');
      setShowCreateForm(false);
      toast.success('API key created');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to revoke API key');
      }

      setKeys(keys.filter(k => k.id !== id));
      toast.success('API key revoked');
    } catch {
      toast.error('Failed to revoke API key');
    }
  };

  const handleCopyKey = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      toast.success('API key copied to clipboard');
    }
  };

  // Not business tier - show upgrade prompt
  if (tier !== 'business') {
    return (
      <Card className="p-6 glass mb-6">
        <h2 className="text-lg font-semibold mb-2">API Access</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Programmatically create and manage QR codes with our REST API.
          This feature is available on the Business plan.
        </p>
        <Button variant="outline" asChild>
          <a href="/plans">View Plans</a>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage your API keys for programmatic access
          </p>
        </div>
        {!showCreateForm && !newKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={keys.length >= 5}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Key
          </Button>
        )}
      </div>

      {/* New key display - show once */}
      {newKey && (
        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <p className="text-sm font-medium text-emerald-400 mb-2">
            Your new API key (copy it now - it won&apos;t be shown again):
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-secondary/50 px-3 py-2 rounded font-mono break-all">
              {newKey}
            </code>
            <Button size="sm" onClick={handleCopyKey}>
              <CopyIcon className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => setNewKey(null)}
          >
            Done
          </Button>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && !newKey && (
        <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
          <Label htmlFor="keyName">Key Name</Label>
          <Input
            id="keyName"
            placeholder="e.g., Production, Development"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="mt-1 mb-3 bg-secondary/50"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={isCreating} size="sm">
              {isCreating ? 'Creating...' : 'Create Key'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : keys.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm">{key.name}</p>
                <p className="text-xs text-muted-foreground">
                  <code className="bg-secondary/50 px-1 rounded">{key.key_prefix}...</code>
                  {' '}&bull;{' '}
                  Created {new Date(key.created_at).toLocaleDateString()}
                  {key.last_used_at && (
                    <>
                      {' '}&bull;{' '}
                      Last used {new Date(key.last_used_at).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => handleRevoke(key.id)}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* API Documentation Link */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          API Base URL: <code className="bg-secondary/50 px-1.5 py-0.5 rounded">/api/v1</code>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Use the Authorization header with your API key: <code>Bearer your_api_key</code>
        </p>
      </div>
    </Card>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
