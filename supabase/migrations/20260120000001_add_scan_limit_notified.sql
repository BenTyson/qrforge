-- Add column to track when user was notified about scan limit
-- This prevents sending multiple emails when limit is reached

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scan_limit_notified_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN profiles.scan_limit_notified_at IS 'Timestamp when user was last notified about reaching scan limit. Reset logic checks if this is before current month start.';
