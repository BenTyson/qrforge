'use client';

import { useState } from 'react';
import { Plus, Target, Pencil, Crown, LayoutGrid, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { CampaignModal } from './CampaignModal';
import type { Campaign, SubscriptionTier, QRCode } from '@/lib/supabase/types';
import { TIER_LIMITS } from '@/lib/supabase/types';

interface CampaignManagerProps {
  campaigns: Campaign[];
  qrCodes: QRCode[];
  selectedCampaign: string | null;
  tier: SubscriptionTier;
  onCampaignSelect: (campaignId: string | null) => void;
  onCampaignCreate: (data: { name: string; description: string; color: string; start_date: string; end_date: string }) => Promise<void>;
  onCampaignUpdate: (id: string, data: { name: string; description: string; color: string; start_date: string; end_date: string }) => Promise<void>;
  onCampaignDelete: (id: string) => Promise<void>;
}

export function CampaignManager({
  campaigns,
  qrCodes,
  selectedCampaign,
  tier,
  onCampaignSelect,
  onCampaignCreate,
  onCampaignUpdate,
  onCampaignDelete,
}: CampaignManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const canUseCampaigns = tier !== 'free';
  const campaignLimit = TIER_LIMITS[tier].campaigns;
  const canCreateMore = typeof campaignLimit === 'number' ? campaigns.length < campaignLimit : true;

  // Count QR codes per campaign
  const getCodeCount = (campaignId: string | null) => {
    if (campaignId === null) {
      return qrCodes.length;
    }
    if (campaignId === 'no-campaign') {
      return qrCodes.filter((qr) => !qr.campaign_id).length;
    }
    return qrCodes.filter((qr) => qr.campaign_id === campaignId).length;
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleSave = async (data: { name: string; description: string; color: string; start_date: string; end_date: string }) => {
    if (editingCampaign) {
      await onCampaignUpdate(editingCampaign.id, data);
    } else {
      await onCampaignCreate(data);
    }
  };

  const handleDelete = async () => {
    if (editingCampaign) {
      await onCampaignDelete(editingCampaign.id);
      // If we deleted the selected campaign, reset selection
      if (selectedCampaign === editingCampaign.id) {
        onCampaignSelect(null);
      }
    }
  };

  // Show upgrade prompt for free users
  if (!canUseCampaigns) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl flex items-center justify-center">
          <Target className="w-6 h-6 text-indigo-500" />
        </div>
        <h3 className="font-semibold mb-2">Group with Campaigns</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade to Pro to create campaigns and track QR code performance by initiative.
        </p>
        <Badge className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          Pro Feature
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Section label */}
      <div className="flex items-center gap-1.5 mr-1">
        <Target className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Campaigns</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors" aria-label="About campaigns">
              <Info className="w-3 h-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="max-w-[240px]">
            Campaigns group QR codes by initiative (e.g. Summer Sale, Product Launch). Use them to track performance across related codes in Analytics.
          </TooltipContent>
        </Tooltip>
        <div className="w-px h-4 bg-border/50 ml-1" />
      </div>

      {/* All QR Codes chip */}
      <button
        onClick={() => onCampaignSelect(null)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          selectedCampaign === null
            ? 'bg-indigo-500 text-white'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        All
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          selectedCampaign === null ? 'bg-white/20' : 'bg-background/50'
        }`}>
          {getCodeCount(null)}
        </span>
      </button>

      {/* No Campaign chip */}
      <button
        onClick={() => onCampaignSelect('no-campaign')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          selectedCampaign === 'no-campaign'
            ? 'bg-indigo-500 text-white'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Target className="w-3.5 h-3.5" />
        No Campaign
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          selectedCampaign === 'no-campaign' ? 'bg-white/20' : 'bg-background/50'
        }`}>
          {getCodeCount('no-campaign')}
        </span>
      </button>

      {/* User campaign chips */}
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          role="button"
          tabIndex={0}
          onClick={() => onCampaignSelect(campaign.id)}
          onKeyDown={(e) => e.key === 'Enter' && onCampaignSelect(campaign.id)}
          className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
            selectedCampaign === campaign.id
              ? 'bg-indigo-500 text-white'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: campaign.color }}
          />
          <span className="max-w-[100px] truncate">{campaign.name}</span>
          <button
            onClick={(e) => handleEditCampaign(campaign, e)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/20 rounded transition-opacity"
            aria-label={`Edit ${campaign.name}`}
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            selectedCampaign === campaign.id ? 'bg-white/20' : 'bg-background/50'
          }`}>
            {getCodeCount(campaign.id)}
          </span>
        </div>
      ))}

      {/* New campaign button */}
      {canCreateMore ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateCampaign}
          className="h-7 px-2.5 text-xs rounded-full"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      ) : (
        <span className="text-[10px] text-muted-foreground px-2">
          {campaigns.length}/{campaignLimit}
        </span>
      )}

      {/* Campaign modal */}
      <CampaignModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        campaign={editingCampaign}
        onSave={handleSave}
        onDelete={editingCampaign ? handleDelete : undefined}
      />
    </div>
  );
}
