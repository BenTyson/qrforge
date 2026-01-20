'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BulkEntry } from './hooks/useBulkState';

interface BulkUploadStepProps {
  rawInput: string;
  entries: BulkEntry[];
  parseError: string | null;
  parseHint: string | null;
  onInputChange: (input: string) => void;
  onRemoveEntry: (id: string) => void;
  onClear: () => void;
  onContinue: () => void;
  canProceed: boolean;
  maxEntries: number;
}

export function BulkUploadStep({
  rawInput,
  entries,
  parseError,
  parseHint,
  onInputChange,
  onRemoveEntry,
  onClear,
  onContinue,
  canProceed,
  maxEntries,
}: BulkUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onInputChange(text);
      };
      reader.readAsText(file);
    }
  }, [onInputChange]);

  // Handle file input
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onInputChange(text);
      };
      reader.readAsText(file);
    }
  }, [onInputChange]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      e.preventDefault();
      onInputChange(text);
    }
  }, [onInputChange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">Upload Your URLs</h2>
        <p className="text-muted-foreground text-sm">
          Add up to {maxEntries} URLs for bulk QR code generation. Each line should be: <code className="px-1 py-0.5 bg-secondary rounded">Name, URL</code>
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-secondary/30',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <p className="font-medium">
              {isDragging ? 'Drop your file here' : 'Drop a CSV file or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports CSV and TXT files
            </p>
          </div>
        </div>
      </div>

      {/* Or divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-background text-sm text-muted-foreground">or paste directly</span>
        </div>
      </div>

      {/* Text input */}
      <div>
        <textarea
          value={rawInput}
          onChange={(e) => onInputChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={`Product Page, https://example.com/product
About Us, https://example.com/about
Contact, https://example.com/contact`}
          className={cn(
            'w-full min-h-[200px] rounded-xl border bg-background px-4 py-3 text-sm font-mono resize-y transition-colors',
            parseError
              ? 'border-red-500 focus:ring-red-500'
              : 'border-border focus:border-primary focus:ring-primary',
          )}
        />

        {/* Entry count / Error */}
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <div>
              {!parseError && entries.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">{entries.length}</span> / {maxEntries} entries parsed
                </p>
              ) : !parseError ? (
                <p className="text-sm text-muted-foreground">
                  Format: Name, URL (one per line)
                </p>
              ) : null}
            </div>
            {(entries.length > 0 || rawInput) && (
              <button
                onClick={onClear}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Error display with hint */}
          {parseError && (
            <div className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-500">Format Error</p>
                  <p className="text-sm text-red-400/80 whitespace-pre-line mt-1">{parseError}</p>
                  {parseHint && (
                    <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">How to fix:</p>
                      <p className="text-sm text-foreground whitespace-pre-line">{parseHint}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parsed entries preview */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Parsed Entries ({entries.length})
          </h3>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border group"
              >
                <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{entry.url}</p>
                </div>
                <button
                  onClick={() => onRemoveEntry(entry.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove entry"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example format */}
      {entries.length === 0 && !rawInput && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <h4 className="text-sm font-medium mb-2">Example Format</h4>
          <pre className="text-xs text-muted-foreground font-mono bg-background p-3 rounded-lg overflow-x-auto">
{`Product Page, https://example.com/product
About Us, https://example.com/about
Contact, https://example.com/contact
Menu, example.com/menu`}
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            URLs without http:// or https:// will automatically use https://
          </p>
        </div>
      )}

      {/* Continue button */}
      <Button
        onClick={onContinue}
        disabled={!canProceed}
        className="w-full"
        size="lg"
      >
        Continue to Styling
        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
