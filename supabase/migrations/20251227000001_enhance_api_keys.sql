-- Enhance API Keys table with additional configuration options
-- Add environment, permissions, expiry, IP whitelist, and usage tracking

-- Add new columns to api_keys
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS environment VARCHAR(20) DEFAULT 'production',
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["read", "create", "update", "delete"]',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ip_whitelist TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_request_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_reset_at TIMESTAMPTZ DEFAULT NULL;

-- Add check constraint for environment
ALTER TABLE api_keys
ADD CONSTRAINT api_keys_environment_check
CHECK (environment IN ('production', 'development', 'testing'));

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);

-- Index for monthly aggregation queries
CREATE INDEX IF NOT EXISTS idx_api_usage_user_month
ON api_usage(user_id, created_at DESC);

-- RLS policies for api_usage
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own API usage
CREATE POLICY "Users can view own API usage"
ON api_usage FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert usage records
CREATE POLICY "Service can insert API usage"
ON api_usage FOR INSERT
WITH CHECK (true);

-- Update api_keys index to include environment
CREATE INDEX IF NOT EXISTS idx_api_keys_environment
ON api_keys(user_id, environment)
WHERE revoked_at IS NULL;

-- Comments
COMMENT ON COLUMN api_keys.environment IS 'production, development, or testing';
COMMENT ON COLUMN api_keys.permissions IS 'JSON array of allowed permissions: read, create, update, delete';
COMMENT ON COLUMN api_keys.expires_at IS 'Optional key expiration date';
COMMENT ON COLUMN api_keys.ip_whitelist IS 'Optional array of allowed IP addresses/CIDRs';
COMMENT ON COLUMN api_keys.request_count IS 'Total lifetime requests made with this key';
COMMENT ON COLUMN api_keys.monthly_request_count IS 'Requests this month (resets monthly)';
COMMENT ON COLUMN api_keys.monthly_reset_at IS 'When monthly count was last reset';

COMMENT ON TABLE api_usage IS 'Detailed API request logs for analytics';

-- Function to reset monthly counters
CREATE OR REPLACE FUNCTION reset_monthly_api_counts()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET
    monthly_request_count = 0,
    monthly_reset_at = NOW()
  WHERE
    monthly_reset_at IS NULL
    OR monthly_reset_at < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Rate limit constant (10,000 requests/month for Business tier)
COMMENT ON FUNCTION reset_monthly_api_counts IS 'Resets monthly API request counters. Business tier limit: 10,000 requests/month';
