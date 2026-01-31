-- Add 'feedback' content type for Feedback Form QR codes
-- Creates feedback_responses table for storing form submissions

-- Update content type constraint to include 'feedback'
ALTER TABLE qr_codes
DROP CONSTRAINT IF EXISTS qr_codes_content_type_check;

ALTER TABLE qr_codes
ADD CONSTRAINT qr_codes_content_type_check
CHECK (content_type IN (
  'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
  'whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok',
  'snapchat', 'threads', 'youtube', 'pinterest', 'spotify', 'reddit',
  'twitch', 'discord', 'apps',
  'google-review',
  'feedback',
  'event',
  'geo',
  'pdf', 'images', 'video', 'mp3',
  'menu', 'business', 'links', 'coupon', 'social'
));

-- Create feedback_responses table
CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  email TEXT,
  ip_hash TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_feedback_responses_qr_code_id
  ON feedback_responses(qr_code_id);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_created_at
  ON feedback_responses(created_at);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_qr_code_created
  ON feedback_responses(qr_code_id, created_at DESC);

-- RLS: Enable row level security
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can read feedback for their own QR codes
CREATE POLICY "Users can read feedback for their QR codes"
  ON feedback_responses
  FOR SELECT
  USING (
    qr_code_id IN (
      SELECT id FROM qr_codes WHERE user_id = auth.uid()
    )
  );

-- Note: Public inserts are handled via the admin client in the API route
-- (bypasses RLS with service role key)
