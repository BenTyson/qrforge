-- Add trial support to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

-- Create index for efficient trial queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at)
WHERE trial_ends_at IS NOT NULL;
