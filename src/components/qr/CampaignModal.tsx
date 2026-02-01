'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Campaign } from '@/lib/supabase/types';

// Preset campaign colors
export const CAMPAIGN_COLORS = [
  '#6366f1', // Indigo (primary)
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#10b981', // Emerald
  '#ec4899', // Pink
] as const;

interface CampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
  onSave: (data: { name: string; description: string; color: string; start_date: string; end_date: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function CampaignModal({
  open,
  onOpenChange,
  campaign,
  onSave,
  onDelete,
}: CampaignModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<string>(CAMPAIGN_COLORS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!campaign;

  // Reset form when modal opens/closes or campaign changes
  useEffect(() => {
    if (open) {
      setName(campaign?.name || '');
      setDescription(campaign?.description || '');
      setColor(campaign?.color || CAMPAIGN_COLORS[0]);
      setStartDate(campaign?.start_date || '');
      setEndDate(campaign?.end_date || '');
      setError(null);
    }
  }, [open, campaign]);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Campaign name is required');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Campaign name must be 100 characters or less');
      return;
    }

    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave({
        name: trimmedName,
        description: description.trim(),
        color,
        start_date: startDate,
        end_date: endDate,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Campaign' : 'Create Campaign'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your campaign details.'
              : 'Create a new campaign to group and track QR codes.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campaign name */}
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="e.g., Summer Sale 2026, Product Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="bg-card/50 border-border/50 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="campaign-description">Description (optional)</Label>
            <textarea
              id="campaign-description"
              placeholder="Brief description of this campaign..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-md bg-card/50 border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2 text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="campaign-start">Start Date (optional)</Label>
              <Input
                id="campaign-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-card/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-end">End Date (optional)</Label>
              <Input
                id="campaign-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-card/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Campaign Color</Label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    color === colorOption
                      ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  type="button"
                >
                  {color === colorOption && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEditing && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="sm:mr-auto"
            >
              Delete Campaign
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
