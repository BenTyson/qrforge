-- QRForge Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Codes table
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('static', 'dynamic')),
  content_type TEXT NOT NULL CHECK (content_type IN ('url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms')),
  content JSONB NOT NULL,
  short_code TEXT UNIQUE, -- for dynamic codes: qrforge.link/abc123
  destination_url TEXT, -- current destination for dynamic codes
  style JSONB DEFAULT '{"foregroundColor": "#000000", "backgroundColor": "#ffffff", "errorCorrectionLevel": "M", "margin": 2}',
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table (for analytics)
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT, -- hashed for privacy
  country TEXT,
  city TEXT,
  region TEXT,
  device_type TEXT,
  os TEXT,
  browser TEXT,
  referrer TEXT
);

-- Indexes for performance
CREATE INDEX idx_qr_codes_user ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_short ON qr_codes(short_code);
CREATE INDEX idx_qr_codes_created ON qr_codes(created_at DESC);
CREATE INDEX idx_scans_qr ON scans(qr_code_id);
CREATE INDEX idx_scans_time ON scans(scanned_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment scan count
CREATE OR REPLACE FUNCTION increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = NEW.qr_code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incrementing scan count
CREATE TRIGGER on_scan_created
  AFTER INSERT ON scans
  FOR EACH ROW EXECUTE FUNCTION increment_scan_count();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- QR Codes policies
CREATE POLICY "Users can view own QR codes"
  ON qr_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create QR codes"
  ON qr_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own QR codes"
  ON qr_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own QR codes"
  ON qr_codes FOR DELETE
  USING (auth.uid() = user_id);

-- Public read for dynamic QR redirects (by short_code)
CREATE POLICY "Anyone can read QR codes by short_code"
  ON qr_codes FOR SELECT
  USING (short_code IS NOT NULL);

-- Scans policies
CREATE POLICY "Users can view scans for own QR codes"
  ON scans FOR SELECT
  USING (
    qr_code_id IN (SELECT id FROM qr_codes WHERE user_id = auth.uid())
  );

-- Allow anonymous inserts for scan tracking
CREATE POLICY "Anyone can create scans"
  ON scans FOR INSERT
  WITH CHECK (true);

-- Function to generate short code
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..7 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCAN LIMITS (Phase 3 - Upgrade Triggers)
-- ============================================

-- Add scan limit tracking columns to profiles
-- Run this migration on existing database:
-- ALTER TABLE profiles ADD COLUMN monthly_scan_count INTEGER DEFAULT 0;
-- ALTER TABLE profiles ADD COLUMN scan_count_reset_at TIMESTAMPTZ DEFAULT NOW();

-- For new deployments, add these columns to profiles table creation above

-- Function to increment user's monthly scan count
CREATE OR REPLACE FUNCTION increment_user_scan_count()
RETURNS TRIGGER AS $$
DECLARE
  qr_owner_id UUID;
BEGIN
  -- Get the owner of the QR code
  SELECT user_id INTO qr_owner_id FROM qr_codes WHERE id = NEW.qr_code_id;

  IF qr_owner_id IS NOT NULL THEN
    -- Check if we need to reset the monthly count (new month)
    UPDATE profiles
    SET
      monthly_scan_count = CASE
        WHEN scan_count_reset_at < date_trunc('month', NOW())
        THEN 1  -- Reset to 1 (this scan)
        ELSE monthly_scan_count + 1
      END,
      scan_count_reset_at = CASE
        WHEN scan_count_reset_at < date_trunc('month', NOW())
        THEN NOW()
        ELSE scan_count_reset_at
      END
    WHERE id = qr_owner_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to track monthly scans per user
CREATE TRIGGER on_scan_increment_user_count
  AFTER INSERT ON scans
  FOR EACH ROW EXECUTE FUNCTION increment_user_scan_count();

-- Function to get user's scan limit based on tier
CREATE OR REPLACE FUNCTION get_scan_limit(tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE tier
    WHEN 'free' THEN RETURN 100;
    WHEN 'pro' THEN RETURN 10000;
    WHEN 'business' THEN RETURN -1; -- unlimited
    ELSE RETURN 100;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- QR EXPIRATION (Phase 3.2 - Pro+ Feature)
-- ============================================

-- Add expiration column to qr_codes
-- Run this migration on existing database:
-- ALTER TABLE qr_codes ADD COLUMN expires_at TIMESTAMPTZ;

-- Index for efficient expiration queries
-- CREATE INDEX idx_qr_codes_expires ON qr_codes(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- PASSWORD PROTECTION (Phase 3.3 - Pro+ Feature)
-- ============================================

-- Add password protection to qr_codes
-- Run this migration on existing database:
-- ALTER TABLE qr_codes ADD COLUMN password_hash TEXT;
