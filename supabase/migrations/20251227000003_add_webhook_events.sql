-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- Auto-delete old events after 7 days to prevent table bloat
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM webhook_events WHERE created_at < NOW() - INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Run cleanup on each insert (simple approach, could use pg_cron for production)
DROP TRIGGER IF EXISTS trigger_cleanup_webhook_events ON webhook_events;
CREATE TRIGGER trigger_cleanup_webhook_events
  AFTER INSERT ON webhook_events
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_webhook_events();

-- RLS: Only service role can access this table
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can access (used by webhook handler)
