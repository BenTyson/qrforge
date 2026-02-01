'use client';

import { useState, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, FolderOpen, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QR_TYPE_LABELS, QR_TYPE_CATEGORIES } from '@/lib/qr/types';
import type { QRContentType } from '@/lib/qr/types';
import type { Folder, Campaign, SubscriptionTier } from '@/lib/supabase/types';

interface QRFiltersProps {
  searchQuery: string;
  selectedType: QRContentType | null;
  selectedStatus: 'active' | 'expired' | 'scheduled' | null;
  selectedFolder: string | null;
  selectedCampaign: string | null;
  folders: Folder[];
  campaigns: Campaign[];
  tier: SubscriptionTier;
  onSearchChange: (query: string) => void;
  onTypeChange: (type: QRContentType | null) => void;
  onStatusChange: (status: 'active' | 'expired' | 'scheduled' | null) => void;
  onFolderChange: (folderId: string | null) => void;
  onCampaignChange: (campaignId: string | null) => void;
}

const STATUS_OPTIONS = [
  { value: null, label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'scheduled', label: 'Scheduled' },
] as const;

const CATEGORY_LABELS: Record<keyof typeof QR_TYPE_CATEGORIES, string> = {
  basic: 'Basic',
  social: 'Social',
  media: 'Media',
  landing: 'Landing Pages',
};

export function QRFilters({
  searchQuery,
  selectedType,
  selectedStatus,
  selectedFolder,
  selectedCampaign,
  folders,
  campaigns,
  tier,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onFolderChange,
  onCampaignChange,
}: QRFiltersProps) {
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    // Debounce the actual search
    const timeout = setTimeout(() => {
      onSearchChange(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [onSearchChange]);

  const hasActiveFilters = selectedType || selectedStatus || selectedFolder || selectedCampaign || searchQuery;
  const canUseFolders = tier !== 'free';
  const canUseCampaigns = tier !== 'free';

  const clearAllFilters = () => {
    setSearchInput('');
    onSearchChange('');
    onTypeChange(null);
    onStatusChange(null);
    onFolderChange(null);
    onCampaignChange(null);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedType) count++;
    if (selectedStatus) count++;
    if (selectedFolder) count++;
    if (selectedCampaign) count++;
    if (searchQuery) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search QR codes..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-card/50 border-border/50 focus:border-primary/50"
          />
          {searchInput && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 bg-card/50 border-border/50 hover:border-primary/50"
            >
              <Filter className="w-4 h-4" />
              {selectedType ? QR_TYPE_LABELS[selectedType] : 'All Types'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border/50">
            <DropdownMenuItem onClick={() => onTypeChange(null)}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(Object.entries(QR_TYPE_CATEGORIES) as [keyof typeof QR_TYPE_CATEGORIES, readonly QRContentType[]][]).map(
              ([category, types]) => (
                <DropdownMenuGroup key={category}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[category]}
                  </DropdownMenuLabel>
                  {types.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => onTypeChange(type)}
                      className={selectedType === type ? 'bg-primary/10 text-primary' : ''}
                    >
                      {QR_TYPE_LABELS[type]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 bg-card/50 border-border/50 hover:border-primary/50"
            >
              {selectedStatus ? STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label : 'All Status'}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border/50">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value ?? 'all'}
                onClick={() => onStatusChange(option.value)}
                className={selectedStatus === option.value ? 'bg-primary/10 text-primary' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Folder filter (Pro+ only) */}
        {canUseFolders && folders.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-card/50 border-border/50 hover:border-primary/50"
              >
                <FolderOpen className="w-4 h-4" />
                {selectedFolder === 'uncategorized'
                  ? 'Uncategorized'
                  : selectedFolder
                    ? folders.find(f => f.id === selectedFolder)?.name || 'Folder'
                    : 'All Folders'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border/50">
              <DropdownMenuItem
                onClick={() => onFolderChange(null)}
                className={selectedFolder === null ? 'bg-primary/10 text-primary' : ''}
              >
                All Folders
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFolderChange('uncategorized')}
                className={selectedFolder === 'uncategorized' ? 'bg-primary/10 text-primary' : ''}
              >
                Uncategorized
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => onFolderChange(folder.id)}
                  className={selectedFolder === folder.id ? 'bg-primary/10 text-primary' : ''}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: folder.color }}
                  />
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Campaign filter (Pro+ only) */}
        {canUseCampaigns && campaigns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-card/50 border-border/50 hover:border-primary/50"
              >
                <Target className="w-4 h-4" />
                {selectedCampaign === 'no-campaign'
                  ? 'No Campaign'
                  : selectedCampaign
                    ? campaigns.find(c => c.id === selectedCampaign)?.name || 'Campaign'
                    : 'All Campaigns'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border/50">
              <DropdownMenuItem
                onClick={() => onCampaignChange(null)}
                className={selectedCampaign === null ? 'bg-primary/10 text-primary' : ''}
              >
                All Campaigns
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCampaignChange('no-campaign')}
                className={selectedCampaign === 'no-campaign' ? 'bg-primary/10 text-primary' : ''}
              >
                No Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {campaigns.map((campaign) => (
                <DropdownMenuItem
                  key={campaign.id}
                  onClick={() => onCampaignChange(campaign.id)}
                  className={selectedCampaign === campaign.id ? 'bg-primary/10 text-primary' : ''}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: campaign.color }}
                  />
                  {campaign.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} active:
          </span>

          {searchQuery && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 gap-1"
            >
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => { setSearchInput(''); onSearchChange(''); }}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedType && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 gap-1"
            >
              Type: {QR_TYPE_LABELS[selectedType]}
              <button onClick={() => onTypeChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedStatus && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 gap-1"
            >
              Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              <button onClick={() => onStatusChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedFolder && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 gap-1"
            >
              Folder: {selectedFolder === 'uncategorized'
                ? 'Uncategorized'
                : folders.find(f => f.id === selectedFolder)?.name}
              <button onClick={() => onFolderChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedCampaign && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 gap-1"
            >
              Campaign: {selectedCampaign === 'no-campaign'
                ? 'No Campaign'
                : campaigns.find(c => c.id === selectedCampaign)?.name}
              <button onClick={() => onCampaignChange(null)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
