'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { generateQRDataURL } from '@/lib/qr/generator';
import { QRStyleEditor } from '@/components/qr/QRStyleEditor';
import { QRLogoUploader } from '@/components/qr/QRLogoUploader';
import type { QRStyleOptions, QRContent } from '@/lib/qr/types';
import { toast } from 'sonner';

interface BulkEntry {
  id: string;
  name: string;
  url: string;
  preview?: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  error?: string;
}

const DEFAULT_STYLE: QRStyleOptions = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  margin: 2,
  width: 256,
};

export default function BulkQRPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<BulkEntry[]>([]);
  const [csvText, setCsvText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tier, setTier] = useState<'free' | 'pro' | 'business'>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Style and features state
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_STYLE);
  const [showOptions, setShowOptions] = useState(false);

  // Feature toggles
  const [enableExpiration, setEnableExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [enableLandingPage, setEnableLandingPage] = useState(false);
  const [landingPageTitle, setLandingPageTitle] = useState('');
  const [landingPageDescription, setLandingPageDescription] = useState('');
  const [landingPageButtonText, setLandingPageButtonText] = useState('Continue');
  const [landingPageTheme, setLandingPageTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const fetchTier = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      setTier((profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business');
      setIsLoading(false);
    };

    fetchTier();
  }, [router]);

  const parseCSV = (text: string): BulkEntry[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      let name = parts[0] || `QR Code ${index + 1}`;
      let url = parts[1] || parts[0];

      // If only one column, use URL as name too
      if (parts.length === 1) {
        name = `QR Code ${index + 1}`;
        url = parts[0];
      }

      // Add https if missing
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      return {
        id: crypto.randomUUID(),
        name,
        url,
        status: 'pending' as const,
      };
    });
  };

  const handleParse = () => {
    if (!csvText.trim()) {
      toast.error('Please enter some data');
      return;
    }

    const parsed = parseCSV(csvText);
    if (parsed.length === 0) {
      toast.error('No valid entries found');
      return;
    }

    if (parsed.length > 100) {
      toast.error('Maximum 100 QR codes per batch');
      return;
    }

    setEntries(parsed);
    toast.success(`Parsed ${parsed.length} entries`);
  };

  const handleGeneratePreviews = async () => {
    setIsGenerating(true);

    const updatedEntries = [...entries];

    for (let i = 0; i < updatedEntries.length; i++) {
      const entry = updatedEntries[i];
      try {
        updatedEntries[i] = { ...entry, status: 'generating' };
        setEntries([...updatedEntries]);

        const content: QRContent = { type: 'url', url: entry.url };
        const preview = await generateQRDataURL(content, { ...style, width: 128 });

        updatedEntries[i] = { ...entry, preview, status: 'done' };
        setEntries([...updatedEntries]);
      } catch (error) {
        updatedEntries[i] = { ...entry, status: 'error', error: 'Failed to generate' };
        setEntries([...updatedEntries]);
      }
    }

    setIsGenerating(false);
    toast.success('Previews generated');
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleSaveAll = async () => {
    if (entries.length === 0) {
      toast.error('No entries to save');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Hash password if enabled
      let passwordHash: string | null = null;
      if (enablePassword && password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // Generate a batch ID for grouping
      const batchId = crypto.randomUUID();

      // Generate short codes for all dynamic QR codes
      const qrCodes = entries.map(entry => ({
        bulk_batch_id: batchId,
        user_id: user.id,
        name: entry.name,
        type: 'dynamic',
        content_type: 'url',
        content: { type: 'url', url: entry.url },
        short_code: generateShortCode(),
        destination_url: entry.url,
        style: {
          foregroundColor: style.foregroundColor,
          backgroundColor: style.backgroundColor,
          errorCorrectionLevel: style.errorCorrectionLevel,
          margin: style.margin,
          ...(style.logoUrl && { logoUrl: style.logoUrl }),
          ...(style.logoSize && { logoSize: style.logoSize }),
        },
        expires_at: enableExpiration && expirationDate ? new Date(expirationDate).toISOString() : null,
        password_hash: passwordHash,
        active_from: enableSchedule && scheduleDate ? new Date(scheduleDate).toISOString() : null,
        active_until: null,
        show_landing_page: enableLandingPage,
        landing_page_title: enableLandingPage ? (landingPageTitle || 'Welcome') : null,
        landing_page_description: enableLandingPage ? landingPageDescription : null,
        landing_page_button_text: enableLandingPage ? (landingPageButtonText || 'Continue') : 'Continue',
        landing_page_theme: enableLandingPage ? landingPageTheme : 'dark',
      }));

      console.log('Inserting QR codes:', JSON.stringify(qrCodes[0], null, 2));

      const { error } = await supabase
        .from('qr_codes')
        .insert(qrCodes);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Database insert failed');
      }

      toast.success(`Created ${entries.length} QR codes`);
      router.push('/qr-codes');
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save QR codes: ${errorMessage}`);
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted/50 rounded w-1/3" />
          <div className="h-64 bg-muted/50 rounded" />
        </div>
      </div>
    );
  }

  if (tier !== 'business') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 text-center glass">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
            <BulkIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Bulk QR Generation</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create up to 100 QR codes at once from a CSV file or pasted data.
            This feature is available on the Business plan.
          </p>
          <Link href="/settings">
            <Button size="lg">
              Upgrade to Business
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/qr-codes" className="hover:text-primary transition-colors">
            QR Codes
          </Link>
          <span>/</span>
          <span>Bulk Generate</span>
        </div>
        <h1 className="text-3xl font-bold">Bulk QR Generation</h1>
        <p className="text-muted-foreground mt-1">
          Create multiple QR codes at once from CSV data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="p-6 glass">
          <Label className="text-base font-medium">CSV Data</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Format: <code className="bg-secondary/50 px-1.5 py-0.5 rounded">Name, URL</code> (one per line)
          </p>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`Product A, https://example.com/a\nProduct B, https://example.com/b\nProduct C, https://example.com/c`}
            className="w-full h-48 px-3 py-2 rounded-lg bg-secondary/50 border border-input font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-3 mt-4">
            <Button onClick={handleParse} variant="outline" className="flex-1">
              Parse CSV
            </Button>
            <label className="flex-1">
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setCsvText(ev.target?.result as string || '');
                    };
                    reader.readAsText(file);
                  }
                }}
              />
              <Button variant="outline" className="w-full pointer-events-none">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </label>
          </div>
        </Card>

        {/* Preview Section */}
        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-medium">Preview</h2>
              <p className="text-sm text-muted-foreground">
                {entries.length} QR codes ready
              </p>
            </div>
            {entries.length > 0 && (
              <Button
                onClick={handleGeneratePreviews}
                variant="outline"
                size="sm"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Previews'}
              </Button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Parse CSV data to preview QR codes
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  {entry.preview ? (
                    <img
                      src={entry.preview}
                      alt={entry.name}
                      className="w-10 h-10 bg-white rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground">
                      {index + 1}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => handleRemoveEntry(entry.id)}
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Customization Options */}
      <div className="mt-6">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
          Customize Style & Features
          <ChevronIcon className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
        </button>

        {showOptions && (
          <div className="mt-4 space-y-6">
            {/* Style Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <QRStyleEditor style={style} onChange={setStyle} />
              </div>
              <div>
                <QRLogoUploader style={style} onChange={setStyle} userTier={tier} />
              </div>
            </div>

            {/* Pro Features */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Features (Applied to all QR codes)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expiration */}
                <Card className="p-4 glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">Expiration Date</p>
                      <p className="text-xs text-muted-foreground">
                        Stop working after this date
                      </p>
                    </div>
                    <Switch
                      checked={enableExpiration}
                      onCheckedChange={setEnableExpiration}
                    />
                  </div>
                  {enableExpiration && (
                    <Input
                      type="datetime-local"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="bg-secondary/50"
                    />
                  )}
                </Card>

                {/* Password */}
                <Card className="p-4 glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">Password Protection</p>
                      <p className="text-xs text-muted-foreground">
                        Require password to access
                      </p>
                    </div>
                    <Switch
                      checked={enablePassword}
                      onCheckedChange={setEnablePassword}
                    />
                  </div>
                  {enablePassword && (
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-secondary/50"
                    />
                  )}
                </Card>

                {/* Scheduled Activation */}
                <Card className="p-4 glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">Scheduled Activation</p>
                      <p className="text-xs text-muted-foreground">
                        Start working at this date
                      </p>
                    </div>
                    <Switch
                      checked={enableSchedule}
                      onCheckedChange={setEnableSchedule}
                    />
                  </div>
                  {enableSchedule && (
                    <Input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-secondary/50"
                    />
                  )}
                </Card>

                {/* Landing Page */}
                <Card className="p-4 glass">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">Branded Landing Page</p>
                      <p className="text-xs text-muted-foreground">
                        Show custom page before redirect
                      </p>
                    </div>
                    <Switch
                      checked={enableLandingPage}
                      onCheckedChange={setEnableLandingPage}
                    />
                  </div>
                  {enableLandingPage && (
                    <div className="space-y-3">
                      <Input
                        placeholder="Page title"
                        value={landingPageTitle}
                        onChange={(e) => setLandingPageTitle(e.target.value)}
                        className="bg-secondary/50"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={landingPageDescription}
                        onChange={(e) => setLandingPageDescription(e.target.value)}
                        className="w-full h-16 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Button text"
                          value={landingPageButtonText}
                          onChange={(e) => setLandingPageButtonText(e.target.value)}
                          className="bg-secondary/50"
                        />
                        <select
                          value={landingPageTheme}
                          onChange={(e) => setLandingPageTheme(e.target.value as 'dark' | 'light')}
                          className="px-3 py-2 rounded-md bg-secondary/50 border border-input text-sm"
                        >
                          <option value="dark">Dark theme</option>
                          <option value="light">Light theme</option>
                        </select>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setEntries([])}
          >
            Clear All
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            size="lg"
          >
            {isSaving ? 'Saving...' : `Create ${entries.length} QR Codes`}
          </Button>
        </div>
      )}
    </div>
  );
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function BulkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
