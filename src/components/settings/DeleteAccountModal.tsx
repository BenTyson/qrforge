'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Mail, CheckCircle, Trash2 } from 'lucide-react';
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

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  deleteToken?: string | null;
}

type Step = 'warning' | 'email-sent' | 'confirm';

export function DeleteAccountModal({
  open,
  onOpenChange,
  userEmail,
  deleteToken,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<Step>('warning');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // If a delete token is provided, validate and show confirm step
  useEffect(() => {
    if (deleteToken && open) {
      validateToken(deleteToken);
    }
  }, [deleteToken, open]);

  // Countdown before allowing final deletion
  useEffect(() => {
    if (step === 'confirm' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('warning');
      setError(null);
      setConfirmEmail('');
      setIsConfirmed(false);
      setCountdown(5);
    }
  }, [open]);

  const validateToken = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/delete-account?token=${token}`);
      const data = await res.json();

      if (data.valid) {
        setStep('confirm');
      } else {
        setError(data.error || 'Invalid or expired token');
        setStep('warning');
      }
    } catch {
      setError('Failed to validate token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request' }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'team_ownership') {
          setError(data.message);
          return;
        }
        throw new Error(data.error || 'Failed to request deletion');
      }

      setStep('email-sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (!deleteToken || !isConfirmed || confirmEmail !== userEmail) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', token: deleteToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Redirect to homepage after successful deletion
      window.location.href = '/?deleted=true';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50">
        {step === 'warning' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm">
                <p className="font-medium text-red-500 mb-2">Warning: Irreversible Action</p>
                <p className="text-muted-foreground mb-2">
                  Deleting your account will permanently remove:
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>All QR codes (static and dynamic)</li>
                  <li>All scan analytics and history</li>
                  <li>All folders and organization</li>
                  <li>All API keys</li>
                  <li>Your profile and account data</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  If you have an active subscription, it will be canceled immediately with no refund.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="confirm-understand"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-1 rounded border-border/50"
                />
                <Label htmlFor="confirm-understand" className="text-sm">
                  I understand that this action is permanent and all my data will be lost forever.
                </Label>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRequestDeletion}
                disabled={isLoading || !isConfirmed}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Confirmation Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'email-sent' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                Check Your Email
              </DialogTitle>
              <DialogDescription>
                We&apos;ve sent a confirmation link to your email address.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
                <p className="font-medium mb-2">Confirmation Email Sent</p>
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation link to <strong>{userEmail}</strong>
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Click the link in the email to confirm your account deletion.
                The link will expire in 24 hours.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="w-5 h-5" />
                Final Confirmation
              </DialogTitle>
              <DialogDescription>
                Enter your email to permanently delete your account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-500 font-medium">
                  This is your last chance to cancel. Once deleted, your account and all data cannot be recovered.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-email">
                  Type <strong>{userEmail}</strong> to confirm:
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={userEmail}
                  className="bg-card/50 border-border/50"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeletion}
                disabled={
                  isLoading ||
                  confirmEmail !== userEmail ||
                  countdown > 0
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : countdown > 0 ? (
                  `Delete Account (${countdown})`
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account Forever
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
