'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WhatsAppContent } from '@/lib/qr/types';

interface WhatsAppFormProps {
  content: Partial<WhatsAppContent>;
  onChange: (content: WhatsAppContent) => void;
}

export function WhatsAppForm({ content, onChange }: WhatsAppFormProps) {
  const handleChange = (field: keyof WhatsAppContent, value: string) => {
    onChange({
      type: 'whatsapp',
      phone: content.phone || '',
      message: content.message,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="waPhone">WhatsApp Number</Label>
        <Input
          id="waPhone"
          type="tel"
          placeholder="+1 234 567 8900"
          value={content.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Include country code (e.g., +1 for US, +44 for UK)
        </p>
      </div>
      <div>
        <Label htmlFor="waMessage">Pre-filled Message (optional)</Label>
        <textarea
          id="waMessage"
          placeholder="Hello! I scanned your QR code..."
          value={content.message || ''}
          onChange={(e) => handleChange('message', e.target.value)}
          className="w-full h-20 mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}
