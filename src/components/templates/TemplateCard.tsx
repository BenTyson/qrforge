'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Template } from '@/lib/templates/types';
import { TEMPLATE_CATEGORY_LABELS } from '@/lib/templates/types';
import { generateQRDataURL } from '@/lib/qr/generator';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import { DEFAULT_STYLE } from '@/lib/qr/types';

interface TemplateCardProps {
  template: Template;
  canAccessPro: boolean;
  onProClick: () => void;
}

export function TemplateCard({ template, canAccessPro, onProClick }: TemplateCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const isPro = template.tier === 'pro';
  const isLocked = isPro && !canAccessPro;

  // Generate QR preview with template style
  useEffect(() => {
    const generatePreview = async () => {
      const demoContent: QRContent = { type: 'url', url: 'https://qrwolf.com' };
      const style: QRStyleOptions = {
        ...DEFAULT_STYLE,
        ...template.style,
        width: 256,
      };

      try {
        const dataUrl = await generateQRDataURL(demoContent, style);
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR preview:', err);
      }
    };

    generatePreview();
  }, [template]);

  // Get background gradient based on template style
  const getPreviewBackground = () => {
    const fg = template.style.foregroundColor || '#000000';
    const bg = template.style.backgroundColor || '#ffffff';

    // If dark background, use lighter gradient overlay
    if (bg !== '#ffffff') {
      return `linear-gradient(135deg, ${bg}ee, ${bg}cc)`;
    }

    // For light backgrounds, create subtle gradient from primary color
    return `linear-gradient(135deg, ${fg}15, ${fg}08)`;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      onProClick();
    }
  };

  const href = `/qr-codes/create?template=${template.id}`;

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group block"
    >
      <Card className={cn(
        'h-full overflow-hidden bg-slate-800/50 backdrop-blur-xl border-slate-700/50',
        'transition-all duration-300',
        'hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10',
        'hover:-translate-y-1'
      )}>
        {/* Preview area */}
        <div
          className="relative aspect-square flex items-center justify-center p-6"
          style={{ background: getPreviewBackground() }}
        >
          {/* QR Preview */}
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`${template.name} preview`}
              className="w-full max-w-[140px] h-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-[140px] h-[140px] rounded-lg bg-slate-700/50 animate-pulse" />
          )}

          {/* Pro badge overlay */}
          {isPro && (
            <div className="absolute top-3 right-3">
              <Badge className={cn(
                'gap-1',
                isLocked
                  ? 'bg-amber-500/90 text-white hover:bg-amber-500'
                  : 'bg-primary/90 text-primary-foreground hover:bg-primary'
              )}>
                <Crown className="w-3 h-3" />
                PRO
              </Badge>
            </div>
          )}

          {/* Locked overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                <Crown className="w-4 h-4 mr-1" />
                Unlock with Pro
              </Button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="p-4">
          <Badge
            variant="outline"
            className="mb-2 text-xs border-slate-600/50 text-slate-400"
          >
            {TEMPLATE_CATEGORY_LABELS[template.category]}
          </Badge>
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {template.description}
          </p>
          <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Use Template
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
