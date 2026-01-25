-- A/B Testing for Dynamic QR Codes
-- Allows Pro+ users to split traffic between destinations to test performance

-- A/B Test configuration
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  winner_variant_id UUID,
  target_confidence DECIMAL(5,4) DEFAULT 0.95,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Only one active (non-completed) test per QR code
  CONSTRAINT one_active_test_per_qr EXCLUDE (qr_code_id WITH =) WHERE (status != 'completed')
);

-- Variants within a test
CREATE TABLE ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- "Control", "Variant B"
  slug TEXT NOT NULL,              -- "a", "b"
  destination_url TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 50 CHECK (weight >= 1 AND weight <= 100),
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_slug_per_test UNIQUE (test_id, slug)
);

-- Visitor assignments (for deterministic routing - same visitor always sees same variant)
CREATE TABLE ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  variant_id UUID NOT NULL REFERENCES ab_variants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_visitor_per_test UNIQUE (test_id, ip_hash)
);

-- Add foreign key for winner_variant_id after ab_variants table exists
ALTER TABLE ab_tests
  ADD CONSTRAINT ab_tests_winner_variant_fk
  FOREIGN KEY (winner_variant_id) REFERENCES ab_variants(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_ab_tests_qr_code_active ON ab_tests(qr_code_id) WHERE status = 'running';
CREATE INDEX idx_ab_tests_qr_code ON ab_tests(qr_code_id);
CREATE INDEX idx_ab_variants_test ON ab_variants(test_id);
CREATE INDEX idx_ab_assignments_lookup ON ab_assignments(test_id, ip_hash);

-- Auto-increment variant scan count on assignment
CREATE OR REPLACE FUNCTION increment_variant_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ab_variants SET scan_count = scan_count + 1 WHERE id = NEW.variant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ab_assignment
  AFTER INSERT ON ab_assignments
  FOR EACH ROW EXECUTE FUNCTION increment_variant_scan_count();

-- Update timestamp trigger for ab_tests
CREATE OR REPLACE FUNCTION update_ab_test_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ab_test_update
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_ab_test_timestamp();

-- RLS Policies

-- Enable RLS
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;

-- ab_tests: Users can manage tests for their own QR codes
CREATE POLICY "Users can view own QR tests"
  ON ab_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = ab_tests.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tests for own QR codes"
  ON ab_tests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own QR tests"
  ON ab_tests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = ab_tests.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own QR tests"
  ON ab_tests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = ab_tests.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

-- ab_variants: Users can manage variants for tests they own
CREATE POLICY "Users can view variants of own tests"
  ON ab_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      JOIN qr_codes ON qr_codes.id = ab_tests.qr_code_id
      WHERE ab_tests.id = ab_variants.test_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create variants for own tests"
  ON ab_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ab_tests
      JOIN qr_codes ON qr_codes.id = ab_tests.qr_code_id
      WHERE ab_tests.id = test_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update variants of own tests"
  ON ab_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      JOIN qr_codes ON qr_codes.id = ab_tests.qr_code_id
      WHERE ab_tests.id = ab_variants.test_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete variants of own tests"
  ON ab_variants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      JOIN qr_codes ON qr_codes.id = ab_tests.qr_code_id
      WHERE ab_tests.id = ab_variants.test_id
      AND qr_codes.user_id = auth.uid()
    )
  );

-- ab_assignments: Public insert (for redirect), owner read
-- Service role will handle inserts during redirect
CREATE POLICY "Users can view assignments for own tests"
  ON ab_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ab_tests
      JOIN qr_codes ON qr_codes.id = ab_tests.qr_code_id
      WHERE ab_tests.id = ab_assignments.test_id
      AND qr_codes.user_id = auth.uid()
    )
  );

-- Service role policy for assignments (bypass RLS for redirect route)
-- The redirect route uses admin client which bypasses RLS anyway
