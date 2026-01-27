'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { copyReferralLink, getReferralLink } from '@/lib/referrals/client';

interface ReferralWidgetProps {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalCredits: number;
}

export function ReferralWidget({
  referralCode,
  totalReferrals,
  pendingReferrals,
  convertedReferrals,
  totalCredits,
}: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyReferralLink(referralCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const referralLink = getReferralLink(referralCode);
  const creditsDisplay = totalCredits > 0 ? `$${(totalCredits / 100).toFixed(2)}` : '$0';

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
          <GiftIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">Invite Friends</h2>
          <p className="text-xs text-muted-foreground">Earn $5 when they upgrade</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm truncate font-mono">
            {referralLink}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold">{totalReferrals}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Invited</div>
        </div>
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-primary">{convertedReferrals}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Upgraded</div>
        </div>
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <div className="text-lg font-bold text-emerald-500">{creditsDisplay}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Earned</div>
        </div>
      </div>

      {/* Pending indicator */}
      {pendingReferrals > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {pendingReferrals} friend{pendingReferrals !== 1 ? 's' : ''} signed up, waiting to upgrade
        </p>
      )}
    </div>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default ReferralWidget;
