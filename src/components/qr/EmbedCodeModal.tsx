'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { generateEmbedCode } from '@/lib/qr/embed-templates';
import type { EmbedType, EmbedFormat } from '@/lib/qr/embed-templates';
import { getAppUrl } from '@/lib/utils';

interface EmbedCodeModalProps {
  open: boolean;
  onClose: () => void;
  svgDataURL: string;
  svgContent: string;
  qrName: string;
  qrId: string | null;
  userTier: 'free' | 'pro' | 'business' | null;
}

const SIZE_OPTIONS = [128, 200, 256, 300, 400, 512] as const;

export function EmbedCodeModal({
  open,
  onClose,
  svgDataURL,
  svgContent,
  qrName,
  qrId,
  userTier,
}: EmbedCodeModalProps) {
  const router = useRouter();
  const canUseDynamic = qrId !== null;
  const [embedType, setEmbedType] = useState<EmbedType>(
    canUseDynamic && (userTier === 'pro' || userTier === 'business') ? 'dynamic' : 'static'
  );
  const [format, setFormat] = useState<EmbedFormat>('html-img');
  const [size, setSize] = useState(256);
  const [showBorder, setShowBorder] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPro = userTier === 'pro' || userTier === 'business';

  // Available formats depend on embed type and tier
  const availableFormats = useMemo(() => {
    const formats: { value: EmbedFormat; label: string; requiresPro: boolean }[] = [];
    if (embedType === 'static') {
      formats.push({ value: 'html-img', label: 'HTML <img>', requiresPro: false });
      formats.push({ value: 'html-inline', label: 'Inline SVG', requiresPro: true });
      formats.push({ value: 'markdown', label: 'Markdown', requiresPro: false });
    } else {
      // Dynamic only supports HTML img
      formats.push({ value: 'html-img', label: 'HTML <img>', requiresPro: false });
    }
    return formats;
  }, [embedType]);

  // Reset format when switching embed type
  const handleEmbedTypeChange = useCallback((type: string) => {
    if (type === 'dynamic' && !isPro) {
      router.push('/plans');
      return;
    }
    setEmbedType(type as EmbedType);
    setFormat('html-img');
  }, [isPro, router]);

  const handleFormatChange = useCallback((value: string) => {
    const formatOption = availableFormats.find(f => f.value === value);
    if (formatOption?.requiresPro && !isPro) {
      router.push('/plans');
      return;
    }
    setFormat(value as EmbedFormat);
  }, [availableFormats, isPro, router]);

  const embedCode = useMemo(() => {
    return generateEmbedCode({
      embedType,
      format,
      size,
      showBorder,
      svgDataURL,
      svgContent,
      qrName,
      qrId,
      baseUrl: getAppUrl(),
    });
  }, [embedType, format, size, showBorder, svgDataURL, svgContent, qrName, qrId]);

  const displayCode = useMemo(() => {
    if (embedType === 'dynamic') return embedCode;
    return embedCode.replace(
      /data:image\/svg\+xml;base64,[A-Za-z0-9+/=]{40,}/g,
      'data:image/svg+xml;base64,...'
    );
  }, [embedCode, embedType]);

  const isCodeTruncated = displayCode !== embedCode;

  const formatHint = useMemo(() => {
    if (embedType === 'dynamic') {
      return 'Paste this tag into your HTML. The QR auto-updates when you change its destination.';
    }
    switch (format) {
      case 'html-img':
        return 'Paste this tag into any HTML page. The QR image is embedded in the code.';
      case 'html-inline':
        return 'Embeds raw SVG markup. Best when you need CSS control over the QR.';
      case 'markdown':
        return 'Use in README files, GitHub, Notion, or any Markdown editor.';
      default:
        return null;
    }
  }, [embedType, format]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy embed code');
    }
  }, [embedCode]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Embed QR Code</DialogTitle>
          <DialogDescription>
            Generate a snippet to embed this QR code on any webpage or document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Embed Type Tabs — only shown when dynamic is possible */}
          {canUseDynamic ? (
            <div className="space-y-2">
              <Label>Embed Type</Label>
              <Tabs value={embedType} onValueChange={handleEmbedTypeChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="static" className="flex-1">Static</TabsTrigger>
                  <TabsTrigger value="dynamic" className="flex-1 gap-1.5">
                    Dynamic
                    {!isPro && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                        Pro
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                {embedType === 'static'
                  ? 'Embeds the QR as inline data. Updates require re-copying the code.'
                  : 'Uses a URL that auto-updates when QR content changes.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Static embed — the QR image is embedded directly in the code.
            </p>
          )}

          {/* Format Select */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={handleFormatChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFormats.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    <span className="flex items-center gap-2">
                      {f.label}
                      {f.requiresPro && !isPro && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                          Pro
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formatHint && (
              <p className="text-xs text-muted-foreground">{formatHint}</p>
            )}
          </div>

          {/* Size Select */}
          <div className="space-y-2">
            <Label>Size (px)</Label>
            <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} &times; {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Border Toggle */}
          {format !== 'markdown' && (
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Border</Label>
                <p className="text-xs text-muted-foreground">
                  Adds a rounded border around the QR code
                </p>
              </div>
              <Switch checked={showBorder} onCheckedChange={setShowBorder} />
            </div>
          )}

          {/* Visual Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center justify-center rounded-lg border border-zinc-700 bg-white p-4">
              <img
                src={svgDataURL}
                alt={qrName}
                width={Math.min(size, 160)}
                height={Math.min(size, 160)}
                style={showBorder && format !== 'markdown' ? {
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                } : undefined}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This is how the QR code will appear on your page.
            </p>
          </div>

          {/* Embed Code Block */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <pre className="bg-zinc-900 text-zinc-100 text-xs font-mono p-4 rounded-lg overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
              {displayCode}
            </pre>
            {isCodeTruncated && (
              <p className="text-xs text-muted-foreground">
                Base64 data shortened for display. The full code will be copied.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCopy}>
            {copied ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </span>
            ) : (
              'Copy Code'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EmbedCodeModal;
