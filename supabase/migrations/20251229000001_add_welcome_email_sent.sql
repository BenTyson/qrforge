-- Add welcome_email_sent column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN profiles.welcome_email_sent IS 'Tracks if welcome email has been sent to user';
