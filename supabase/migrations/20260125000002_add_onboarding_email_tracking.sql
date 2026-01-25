-- Track sent onboarding emails to prevent duplicates
CREATE TABLE IF NOT EXISTS onboarding_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('day1', 'day3', 'day7', 'trial_ending', 'scans_50', 'qr_codes_5', 'usage_80')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email_type)
);

-- Enable RLS
ALTER TABLE onboarding_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can access (used by cron/scheduled jobs)
CREATE POLICY "Service role can manage onboarding emails"
  ON onboarding_emails
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_emails_user_id ON onboarding_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_emails_type ON onboarding_emails(email_type);

-- Add unsubscribe flag to profiles for marketing emails
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_unsubscribed BOOLEAN DEFAULT FALSE;
