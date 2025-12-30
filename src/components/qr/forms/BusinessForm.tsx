'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogoUploader } from '@/components/qr/LogoUploader';
import { SocialLinksEditor } from './SocialLinksEditor';
import type { BusinessContent } from '@/lib/qr/types';

interface BusinessFormProps {
  content: Partial<BusinessContent>;
  onChange: (content: BusinessContent) => void;
}

export function BusinessForm({ content, onChange }: BusinessFormProps) {
  const handleChange = (field: keyof BusinessContent, value: string) => {
    onChange({
      type: 'business',
      name: content.name || '',
      title: content.title,
      company: content.company,
      email: content.email,
      phone: content.phone,
      website: content.website,
      address: content.address,
      photoUrl: content.photoUrl,
      socialLinks: content.socialLinks,
      bio: content.bio,
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  const handleSocialLinksChange = (socialLinks: { platform: string; url: string }[]) => {
    onChange({
      type: 'business',
      name: content.name || '',
      title: content.title,
      company: content.company,
      email: content.email,
      phone: content.phone,
      website: content.website,
      address: content.address,
      photoUrl: content.photoUrl,
      socialLinks: socialLinks as BusinessContent['socialLinks'],
      bio: content.bio,
      accentColor: content.accentColor,
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="businessName">Full Name *</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="John Doe"
            value={content.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="businessTitle">Job Title</Label>
          <Input
            id="businessTitle"
            type="text"
            placeholder="Software Engineer"
            value={content.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="businessCompany">Company</Label>
          <Input
            id="businessCompany"
            type="text"
            placeholder="Acme Inc."
            value={content.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessEmail">Email</Label>
          <Input
            id="businessEmail"
            type="email"
            placeholder="john@example.com"
            value={content.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="businessPhone">Phone</Label>
          <Input
            id="businessPhone"
            type="tel"
            placeholder="+1 234 567 8900"
            value={content.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="businessWebsite">Website</Label>
          <Input
            id="businessWebsite"
            type="url"
            placeholder="https://johndoe.com"
            value={content.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="businessAddress">Address</Label>
          <Input
            id="businessAddress"
            type="text"
            placeholder="123 Main St, City, State 12345"
            value={content.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <Label htmlFor="businessBio">Bio (optional)</Label>
        <textarea
          id="businessBio"
          placeholder="A short bio about yourself..."
          value={content.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          className="w-full h-20 mt-1 px-3 py-2 rounded-md bg-secondary/50 border border-input resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <Label>Profile Photo (optional)</Label>
        <LogoUploader
          value={content.photoUrl}
          onChange={(url) => handleChange('photoUrl', url || '')}
          placeholder="Upload your photo"
          className="mt-1"
        />
      </div>

      {/* Social Links */}
      <SocialLinksEditor
        links={content.socialLinks || []}
        onChange={handleSocialLinksChange}
      />

      {/* Accent Color */}
      <div>
        <Label htmlFor="businessAccent">Accent Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="businessAccent"
            type="color"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50"
          />
          <Input
            type="text"
            value={content.accentColor || '#14b8a6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50"
            placeholder="#14b8a6"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        Create a digital business card. When scanned, users can view your contact info and save it to their phone.
      </p>
    </div>
  );
}
