-- Add referral system to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_credits INTEGER DEFAULT 0;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'credited')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  UNIQUE(referee_id) -- Each user can only be referred once
);

-- Generate unique referral codes for existing users who don't have one
-- Uses first 8 chars of their UUID for simplicity
UPDATE profiles
SET referral_code = UPPER(SUBSTR(REPLACE(id::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- Create function to generate referral code for new users
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTR(REPLACE(NEW.id::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate referral code on new profile
DROP TRIGGER IF EXISTS auto_generate_referral_code ON profiles;
CREATE TRIGGER auto_generate_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Enable RLS on referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can see referrals where they are the referrer
CREATE POLICY "Users can view their referrals"
  ON referrals
  FOR SELECT
  USING (referrer_id = auth.uid());

-- Users can see if they were referred (their own referee record)
CREATE POLICY "Users can view their own referee record"
  ON referrals
  FOR SELECT
  USING (referee_id = auth.uid());

-- Only system/service role can insert/update referrals
CREATE POLICY "Service role can manage referrals"
  ON referrals
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
