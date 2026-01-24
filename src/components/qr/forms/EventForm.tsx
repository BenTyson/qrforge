'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { EventContent } from '@/lib/qr/types';

interface EventFormProps {
  content: Partial<EventContent>;
  onChange: (content: EventContent) => void;
}

export function EventForm({ content, onChange }: EventFormProps) {
  const handleChange = (field: keyof EventContent, value: string | boolean) => {
    onChange({
      type: 'event',
      title: content.title || '',
      startDate: content.startDate || '',
      endDate: content.endDate || '',
      description: content.description,
      location: content.location,
      allDay: content.allDay,
      timezone: content.timezone,
      url: content.url,
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  // Get today's date in local datetime format for min attribute
  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-4">
      {/* Event Title */}
      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          type="text"
          placeholder="Annual Team Meeting"
          value={content.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
      </div>

      {/* All-Day Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleChange('allDay', !content.allDay)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            content.allDay ? 'bg-primary' : 'bg-secondary'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              content.allDay ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <Label className="cursor-pointer" onClick={() => handleChange('allDay', !content.allDay)}>
          All-day event
        </Label>
      </div>

      {/* Date/Time Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start {content.allDay ? 'Date' : 'Date & Time'} *</Label>
          <Input
            id="startDate"
            type={content.allDay ? 'date' : 'datetime-local'}
            min={content.allDay ? today.slice(0, 10) : today}
            value={content.allDay ? (content.startDate?.slice(0, 10) || '') : (content.startDate || '')}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="endDate">End {content.allDay ? 'Date' : 'Date & Time'} *</Label>
          <Input
            id="endDate"
            type={content.allDay ? 'date' : 'datetime-local'}
            min={content.allDay ? (content.startDate?.slice(0, 10) || today.slice(0, 10)) : (content.startDate || today)}
            value={content.allDay ? (content.endDate?.slice(0, 10) || '') : (content.endDate || '')}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
      </div>

      {/* Validation message */}
      {content.startDate && content.endDate && new Date(content.endDate) <= new Date(content.startDate) && (
        <p className="text-sm text-red-500">End date must be after start date</p>
      )}

      {/* Location */}
      <div>
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          type="text"
          placeholder="123 Main St, City, State"
          value={content.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          placeholder="Event details, agenda, what to bring..."
          value={content.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="mt-1 w-full min-h-[80px] rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Event URL */}
      <div>
        <Label htmlFor="url">Event Website (optional)</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com/event"
          value={content.url || ''}
          onChange={(e) => handleChange('url', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="accentColor">Accent Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="accentColor"
            type="color"
            value={content.accentColor || '#3B82F6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50 cursor-pointer"
          />
          <Input
            type="text"
            placeholder="#3B82F6"
            value={content.accentColor || '#3B82F6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50 font-mono"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Customize the landing page accent color
        </p>
      </div>

      {/* Preview hint */}
      {content.title && content.startDate && content.endDate && (
        <div className="p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${content.accentColor || '#3B82F6'}20` }}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={content.accentColor || '#3B82F6'}
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{content.title}</p>
              <p className="text-xs text-muted-foreground">
                {content.allDay ? (
                  <>
                    {new Date(content.startDate + 'T00:00:00').toLocaleDateString()}
                    {content.startDate !== content.endDate && (
                      <> - {new Date(content.endDate + 'T00:00:00').toLocaleDateString()}</>
                    )}
                  </>
                ) : (
                  <>
                    {new Date(content.startDate).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </>
                )}
              </p>
              {content.location && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{content.location}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
