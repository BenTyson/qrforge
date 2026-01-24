'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { RedditContent } from '@/lib/qr/types';

interface RedditFormProps {
  content: Partial<RedditContent>;
  onChange: (content: RedditContent) => void;
}

/**
 * Extracts Reddit username or subreddit from various input formats:
 * - "johndoe" -> { type: 'user', value: 'johndoe' }
 * - "u/johndoe" -> { type: 'user', value: 'johndoe' }
 * - "r/programming" -> { type: 'subreddit', value: 'programming' }
 * - "reddit.com/r/programming" -> { type: 'subreddit', value: 'programming' }
 * - "reddit.com/u/johndoe" -> { type: 'user', value: 'johndoe' }
 */
function parseRedditInput(input: string): { type: 'user' | 'subreddit'; value: string } | null {
  const trimmed = input.trim();

  // Check for Reddit URL patterns
  const urlPatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:old\.)?reddit\.com\/r\/([a-zA-Z0-9_]+)/i,
    /(?:https?:\/\/)?(?:www\.)?(?:old\.)?reddit\.com\/u(?:ser)?\/([a-zA-Z0-9_-]+)/i,
  ];

  // Check for subreddit URL
  const subredditMatch = trimmed.match(urlPatterns[0]);
  if (subredditMatch && subredditMatch[1]) {
    return { type: 'subreddit', value: subredditMatch[1] };
  }

  // Check for user URL
  const userMatch = trimmed.match(urlPatterns[1]);
  if (userMatch && userMatch[1]) {
    return { type: 'user', value: userMatch[1] };
  }

  // Check for r/subreddit or u/username format
  const prefixMatch = trimmed.match(/^(r|u)\/([a-zA-Z0-9_-]+)$/i);
  if (prefixMatch) {
    return {
      type: prefixMatch[1].toLowerCase() === 'r' ? 'subreddit' : 'user',
      value: prefixMatch[2],
    };
  }

  // Plain text - return as-is, type will be determined by tab selection
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { type: 'user', value: trimmed };
  }

  return null;
}

export function RedditForm({ content, onChange }: RedditFormProps) {
  const [activeTab, setActiveTab] = useState<'user' | 'subreddit'>(content.contentType || 'user');

  const handleInputChange = (value: string) => {
    const parsed = parseRedditInput(value);

    if (parsed) {
      // If input has explicit type (r/ or u/), use that
      if (value.startsWith('r/') || value.toLowerCase().includes('/r/')) {
        setActiveTab('subreddit');
        onChange({
          type: 'reddit',
          subreddit: parsed.value,
          username: undefined,
          contentType: 'subreddit',
        });
      } else if (value.startsWith('u/') || value.toLowerCase().includes('/u')) {
        setActiveTab('user');
        onChange({
          type: 'reddit',
          username: parsed.value,
          subreddit: undefined,
          contentType: 'user',
        });
      } else {
        // Use current tab selection
        onChange({
          type: 'reddit',
          username: activeTab === 'user' ? parsed.value : undefined,
          subreddit: activeTab === 'subreddit' ? parsed.value : undefined,
          contentType: activeTab,
        });
      }
    } else {
      // Invalid input, keep it but clear the structured data
      onChange({
        type: 'reddit',
        username: activeTab === 'user' ? value : undefined,
        subreddit: activeTab === 'subreddit' ? value : undefined,
        contentType: activeTab,
      });
    }
  };

  const handleTabChange = (tab: 'user' | 'subreddit') => {
    setActiveTab(tab);
    const currentValue = content.username || content.subreddit || '';
    onChange({
      type: 'reddit',
      username: tab === 'user' ? currentValue : undefined,
      subreddit: tab === 'subreddit' ? currentValue : undefined,
      contentType: tab,
    });
  };

  const currentValue = activeTab === 'user' ? (content.username || '') : (content.subreddit || '');
  const previewUrl = currentValue
    ? activeTab === 'user'
      ? `https://reddit.com/u/${currentValue}`
      : `https://reddit.com/r/${currentValue}`
    : '';

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('user')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'user'
              ? 'bg-[#FF4500] text-white'
              : 'bg-secondary/50 hover:bg-secondary'
          )}
        >
          User Profile
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('subreddit')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'subreddit'
              ? 'bg-[#FF4500] text-white'
              : 'bg-secondary/50 hover:bg-secondary'
          )}
        >
          Subreddit
        </button>
      </div>

      <div>
        <Label htmlFor="redditInput">
          {activeTab === 'user' ? 'Reddit Username' : 'Subreddit Name'}
        </Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {activeTab === 'user' ? 'u/' : 'r/'}
          </span>
          <Input
            id="redditInput"
            type="text"
            placeholder={activeTab === 'user' ? 'username' : 'subreddit'}
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-8 bg-secondary/50"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {activeTab === 'user'
            ? 'Enter a Reddit username or paste a profile URL'
            : 'Enter a subreddit name or paste a subreddit URL'}
        </p>
      </div>

      {previewUrl && (
        <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
          <span className="font-medium">Redirect URL:</span>{' '}
          <span className="text-primary">{previewUrl}</span>
        </div>
      )}
    </div>
  );
}
