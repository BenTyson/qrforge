'use client';

import { useState } from 'react';
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
import {
  PDFOptions,
  DEFAULT_PDF_OPTIONS,
  getPaperSizeOptions,
  getBleedOptions,
  getQRSizeOptions,
  generatePrintPDF,
} from '@/lib/qr/pdf-generator';

interface PDFOptionsModalProps {
  open: boolean;
  onClose: () => void;
  svgContent: string;
  qrName?: string;
}

export function PDFOptionsModal({
  open,
  onClose,
  svgContent,
  qrName = 'QR Code',
}: PDFOptionsModalProps) {
  const [options, setOptions] = useState<PDFOptions>(DEFAULT_PDF_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paperSizes = getPaperSizeOptions();
  const bleedOptions = getBleedOptions();
  const qrSizes = getQRSizeOptions();

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const blob = await generatePrintPDF(svgContent, {
        ...options,
        title: qrName,
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qrName.replace(/[^a-z0-9]/gi, '_')}_print.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Print-Ready PDF</DialogTitle>
          <DialogDescription>
            Configure your print settings for professional output
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Paper Size */}
          <div className="space-y-2">
            <Label>Paper Size</Label>
            <Select
              value={options.paperSize}
              onValueChange={(value: 'letter' | 'a4') =>
                setOptions({ ...options, paperSize: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paperSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label} ({size.dimensions})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* QR Size */}
          <div className="space-y-2">
            <Label>QR Code Size</Label>
            <Select
              value={String(options.qrSize)}
              onValueChange={(value) =>
                setOptions({ ...options, qrSize: parseFloat(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qrSizes.map((size) => (
                  <SelectItem key={size.value} value={String(size.value)}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bleed */}
          <div className="space-y-2">
            <Label>Bleed Area</Label>
            <Select
              value={String(options.bleedSize)}
              onValueChange={(value) =>
                setOptions({ ...options, bleedSize: parseFloat(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bleedOptions.map((bleed) => (
                  <SelectItem key={bleed.value} value={String(bleed.value)}>
                    {bleed.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Extra area around QR for edge-to-edge printing
            </p>
          </div>

          {/* Crop Marks */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Crop Marks</Label>
              <p className="text-xs text-muted-foreground">
                Guides for precise cutting
              </p>
            </div>
            <Switch
              checked={options.showCropMarks}
              onCheckedChange={(checked) =>
                setOptions({ ...options, showCropMarks: checked })
              }
            />
          </div>

          {/* Instructions */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Include Print Instructions</Label>
              <p className="text-xs text-muted-foreground">
                Tips for best results
              </p>
            </div>
            <Switch
              checked={options.includeInstructions}
              onCheckedChange={(checked) =>
                setOptions({ ...options, includeInstructions: checked })
              }
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PDFOptionsModal;
