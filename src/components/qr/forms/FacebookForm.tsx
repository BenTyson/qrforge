'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FacebookContent } from '@/lib/qr/types';

interface FacebookFormProps {
  content: Partial<FacebookContent>;
  onChange: (content: FacebookContent) => void;
}

export function FacebookForm({ content, onChange }: FacebookFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fbUrl">Facebook Profile or Page URL</Label>
        <Input
          id="fbUrl"
          type="url"
          placeholder="https://facebook.com/yourpage"
          value={content.profileUrl || ''}
          onChange={(e) => onChange({
            type: 'facebook',
            profileUrl: e.target.value,
          })}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter the full URL to your Facebook profile or page
        </p>
      </div>
    </div>
  );
}
