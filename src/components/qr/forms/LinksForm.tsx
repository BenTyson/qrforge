'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LogoUploader } from '@/components/qr/LogoUploader';
import type { LinksContent } from '@/lib/qr/types';

interface LinksFormProps {
  content: Partial<LinksContent>;
  onChange: (content: LinksContent) => void;
}

export function LinksForm({ content, onChange }: LinksFormProps) {
  const links = content.links || [{ title: '', url: '' }];

  const handleFieldChange = (field: keyof LinksContent, value: string) => {
    onChange({
      type: 'links',
      title: content.title || '',
      description: content.description,
      avatarUrl: content.avatarUrl,
      links: content.links || [],
      socialLinks: content.socialLinks,
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({
      type: 'links',
      title: content.title || '',
      description: content.description,
      avatarUrl: content.avatarUrl,
      links: newLinks,
      socialLinks: content.socialLinks,
      accentColor: content.accentColor,
    });
  };

  const addLink = () => {
    onChange({
      type: 'links',
      title: content.title || '',
      description: content.description,
      avatarUrl: content.avatarUrl,
      links: [...links, { title: '', url: '' }],
      socialLinks: content.socialLinks,
      accentColor: content.accentColor,
    });
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      onChange({
        type: 'links',
        title: content.title || '',
        description: content.description,
        avatarUrl: content.avatarUrl,
        links: newLinks,
        socialLinks: content.socialLinks,
        accentColor: content.accentColor,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="linksTitle">Page Title</Label>
          <Input
            id="linksTitle"
            type="text"
            placeholder="My Links"
            value={content.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="linksDescription">Description (optional)</Label>
          <Input
            id="linksDescription"
            type="text"
            placeholder="Check out my links below!"
            value={content.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div className="col-span-2">
          <Label>Avatar (optional)</Label>
          <LogoUploader
            value={content.avatarUrl}
            onChange={(url) => handleFieldChange('avatarUrl', url || '')}
            placeholder="Upload profile picture"
            className="mt-1"
          />
        </div>
      </div>

      {/* Links Section */}
      <div>
        <Label className="mb-3 block">Links</Label>
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  placeholder="Link title"
                  value={link.title}
                  onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                  className="bg-secondary/50"
                />
                <Input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
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
          Add Link
        </Button>
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="accentColor">Accent Color (optional)</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="accentColor"
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
        Create a Linktree-style page with multiple links. Perfect for sharing all your important links in one place.
      </p>
    </div>
  );
}
