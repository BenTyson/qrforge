'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InstagramContent } from '@/lib/qr/types';

interface InstagramFormProps {
  content: Partial<InstagramContent>;
  onChange: (content: InstagramContent) => void;
}

export function InstagramForm({ content, onChange }: InstagramFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="igUsername">Instagram Username</Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
          <Input
            id="igUsername"
            type="text"
            placeholder="username"
            value={content.username?.replace('@', '') || ''}
            onChange={(e) => onChange({
              type: 'instagram',
              username: e.target.value.replace('@', ''),
            })}
            className="pl-8 bg-secondary/50"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Instagram username without the @ symbol
        </p>
      </div>
    </div>
  );
}
