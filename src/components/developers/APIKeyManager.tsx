'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  environment?: string;
  request_count?: number;
  monthly_request_count?: number;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

interface APIKeyManagerProps {
  initialKeys: ApiKey[];
}

export function APIKeyManager({ initialKeys }: APIKeyManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    environment: 'production' as 'production' | 'development' | 'testing',
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          environment: formData.environment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create API key');
      }

      const data = await res.json();
      setNewKey(data.key);
      setKeys([{ ...data, key: undefined }, ...keys]);
      setFormData({ name: '', environment: 'production' });
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

  const getEnvironmentBadge = (env?: string) => {
    const colors: Record<string, string> = {
      production: 'bg-emerald-500/20 text-emerald-400',
      development: 'bg-blue-500/20 text-blue-400',
      testing: 'bg-amber-500/20 text-amber-400',
    };
    return colors[env || 'production'] || colors.production;
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your API keys
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
        <div className="mb-4 p-4 bg-secondary/30 rounded-lg space-y-4">
          <div>
            <Label htmlFor="keyName">Key Name *</Label>
            <Input
              id="keyName"
              placeholder="e.g., Production Server, Dev Testing"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 bg-secondary/50"
            />
          </div>

          <div>
            <Label>Environment</Label>
            <div className="flex gap-2 mt-2">
              {(['production', 'development', 'testing'] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setFormData({ ...formData, environment: env })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.environment === env
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {env.charAt(0).toUpperCase() + env.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate} disabled={isCreating} size="sm">
              {isCreating ? 'Creating...' : 'Create Key'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateForm(false);
                setFormData({ name: '', environment: 'production' });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{key.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getEnvironmentBadge(key.environment)}`}>
                    {key.environment || 'production'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <code className="bg-secondary/50 px-1 rounded">{key.key_prefix}...</code>
                  <span>&bull;</span>
                  <span>{(key.request_count || 0).toLocaleString()} requests</span>
                  {key.last_used_at && (
                    <>
                      <span>&bull;</span>
                      <span>Used {new Date(key.last_used_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 ml-2"
                onClick={() => handleRevoke(key.id)}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}

      {keys.length >= 5 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Maximum 5 API keys allowed
        </p>
      )}
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
