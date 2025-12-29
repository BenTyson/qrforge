'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LogoUploader } from '@/components/qr/LogoUploader';
import type { SocialContent } from '@/lib/qr/types';

interface SocialFormProps {
  content: Partial<SocialContent>;
  onChange: (content: SocialContent) => void;
}

const PLATFORMS = [
  { value: 'twitter', label: 'Twitter / X', placeholder: '@username' },
  { value: 'instagram', label: 'Instagram', placeholder: '@username' },
  { value: 'facebook', label: 'Facebook', placeholder: 'username or page' },
  { value: 'tiktok', label: 'TikTok', placeholder: '@username' },
  { value: 'youtube', label: 'YouTube', placeholder: '@channel' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'in/username' },
  { value: 'github', label: 'GitHub', placeholder: 'username' },
  { value: 'twitch', label: 'Twitch', placeholder: 'username' },
  { value: 'discord', label: 'Discord', placeholder: 'invite code' },
] as const;

type Platform = typeof PLATFORMS[number]['value'];

export function SocialForm({ content, onChange }: SocialFormProps) {
  const links = content.links || [];

  const handleFieldChange = (field: keyof SocialContent, value: string) => {
    onChange({
      type: 'social',
      name: content.name || '',
      bio: content.bio,
      avatarUrl: content.avatarUrl,
      links: content.links || [],
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  const handleLinkChange = (index: number, field: 'handle' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({
      type: 'social',
      name: content.name || '',
      bio: content.bio,
      avatarUrl: content.avatarUrl,
      links: newLinks,
      accentColor: content.accentColor,
    });
  };

  const handlePlatformChange = (index: number, platform: Platform) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], platform, url: '' };
    onChange({
      type: 'social',
      name: content.name || '',
      bio: content.bio,
      avatarUrl: content.avatarUrl,
      links: newLinks,
      accentColor: content.accentColor,
    });
  };

  const addLink = () => {
    onChange({
      type: 'social',
      name: content.name || '',
      bio: content.bio,
      avatarUrl: content.avatarUrl,
      links: [...links, { platform: 'instagram' as Platform, handle: '', url: '' }],
      accentColor: content.accentColor,
    });
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      onChange({
        type: 'social',
        name: content.name || '',
        bio: content.bio,
        avatarUrl: content.avatarUrl,
        links: newLinks,
        accentColor: content.accentColor,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="socialName">Display Name *</Label>
          <Input
            id="socialName"
            type="text"
            placeholder="Your Name"
            value={content.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="socialBio">Bio (optional)</Label>
          <textarea
            id="socialBio"
            placeholder="A short bio..."
            value={content.bio || ''}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            className="w-full h-16 mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="col-span-2">
          <Label>Profile Photo (optional)</Label>
          <LogoUploader
            value={content.avatarUrl}
            onChange={(url) => handleFieldChange('avatarUrl', url || '')}
            placeholder="Upload profile photo"
            className="mt-1"
          />
        </div>
      </div>

      {/* Social Links Section */}
      <div>
        <Label className="mb-3 block">Social Profiles</Label>
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={link.platform}
                onChange={(e) => handlePlatformChange(index, e.target.value as Platform)}
                className="w-32 px-3 py-2 rounded-md bg-secondary/50 border border-input shrink-0"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <Input
                type="text"
                placeholder={PLATFORMS.find((p) => p.value === link.platform)?.placeholder || 'Handle'}
                value={link.handle}
                onChange={(e) => handleLinkChange(index, 'handle', e.target.value)}
                className="flex-1 bg-secondary/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(index)}
                disabled={links.length <= 1}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLink}
          className="mt-3"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Profile
        </Button>
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="socialAccent">Accent Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="socialAccent"
            type="color"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleFieldChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50"
          />
          <Input
            type="text"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleFieldChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50"
            placeholder="#14b8a6"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        Create a social media hub. When scanned, users will see all your social profiles in one place.
      </p>
    </div>
  );
}
