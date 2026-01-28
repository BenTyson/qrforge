-- Add billing_interval column to profiles table
-- Tracks whether a subscriber is on monthly or yearly billing
ALTER TABLE profiles ADD COLUMN billing_interval TEXT DEFAULT 'monthly'
  CHECK (billing_interval IN ('monthly', 'yearly'));

-- Backfill known yearly subscriber
UPDATE profiles SET billing_interval = 'yearly' WHERE email = 'susan@silvermineart.org';
