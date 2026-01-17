-- QRWolf Development Seed Data
-- This file is used to populate the development database with test data.
-- DO NOT run this against production!
--
-- Usage:
--   supabase db reset  (will run migrations + this seed file)
--   OR
--   psql -f seed.sql   (to run manually against dev database)

-- ============================================================================
-- SAFETY CHECK
-- ============================================================================
-- This will fail if run against production (which has real data)
DO $$
BEGIN
  -- Check if we already have many profiles (indicates production)
  IF (SELECT COUNT(*) FROM auth.users) > 10 THEN
    RAISE EXCEPTION 'SAFETY: This seed file should not be run on a database with existing users. Aborting.';
  END IF;
END $$;

-- ============================================================================
-- TEST USERS (created via Supabase Auth)
-- ============================================================================
-- Note: In development, create users via the Supabase dashboard or Auth API.
-- The profiles below assume these user IDs exist.

-- For local development with supabase start, you can create users like this:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   '11111111-1111-1111-1111-111111111111',
--   'dev@qrwolf.com',
--   crypt('devpassword123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW()
-- );

-- ============================================================================
-- SAMPLE PROFILES
-- ============================================================================
-- These will be created automatically when users sign up via the trigger,
-- but for development we can create them manually.

-- Note: These UUIDs are placeholders. In real development, you would:
-- 1. Create users via Supabase Auth (Dashboard or API)
-- 2. Get their actual UUIDs
-- 3. Update these INSERT statements if needed

-- Example profile data (commented out - uncomment and modify as needed):
/*
INSERT INTO public.profiles (id, email, full_name, subscription_tier, created_at, updated_at)
VALUES
  -- Free tier test user
  ('11111111-1111-1111-1111-111111111111', 'free@test.com', 'Free User', 'free', NOW(), NOW()),
  -- Pro tier test user
  ('22222222-2222-2222-2222-222222222222', 'pro@test.com', 'Pro User', 'pro', NOW(), NOW()),
  -- Business tier test user
  ('33333333-3333-3333-3333-333333333333', 'business@test.com', 'Business User', 'business', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  subscription_tier = EXCLUDED.subscription_tier,
  updated_at = NOW();
*/

-- ============================================================================
-- SAMPLE QR CODES
-- ============================================================================
/*
-- Static QR code for free user
INSERT INTO public.qr_codes (
  id, user_id, name, type, content_type, content, style, created_at, updated_at
)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'My Website',
  'static',
  'url',
  '{"url": "https://example.com"}',
  '{"foregroundColor": "#000000", "backgroundColor": "#ffffff", "errorCorrectionLevel": "M", "margin": 2}',
  NOW(),
  NOW()
);

-- Dynamic QR code for pro user
INSERT INTO public.qr_codes (
  id, user_id, name, type, content_type, content, short_code, destination_url, style, created_at, updated_at
)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '22222222-2222-2222-2222-222222222222',
  'Marketing Campaign',
  'dynamic',
  'url',
  '{"url": "https://mysite.com/campaign"}',
  'abc123',
  'https://mysite.com/campaign',
  '{"foregroundColor": "#1a365d", "backgroundColor": "#ffffff", "errorCorrectionLevel": "H", "margin": 2}',
  NOW(),
  NOW()
);
*/

-- ============================================================================
-- SAMPLE SCANS
-- ============================================================================
/*
-- Generate some sample scans for the dynamic QR code
INSERT INTO public.scans (qr_code_id, scanned_at, country, city, device_type, os, browser)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  NOW() - (random() * interval '30 days'),
  (ARRAY['US', 'UK', 'CA', 'DE', 'FR'])[floor(random() * 5 + 1)],
  (ARRAY['New York', 'London', 'Toronto', 'Berlin', 'Paris'])[floor(random() * 5 + 1)],
  (ARRAY['mobile', 'desktop', 'tablet'])[floor(random() * 3 + 1)],
  (ARRAY['iOS', 'Android', 'Windows', 'macOS'])[floor(random() * 4 + 1)],
  (ARRAY['Safari', 'Chrome', 'Firefox', 'Edge'])[floor(random() * 4 + 1)]
FROM generate_series(1, 50);
*/

-- ============================================================================
-- SAMPLE FOLDERS
-- ============================================================================
/*
INSERT INTO public.folders (id, user_id, name, color, created_at, updated_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Marketing', '#3b82f6', NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Events', '#10b981', NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'Products', '#f59e0b', NOW(), NOW());
*/

-- ============================================================================
-- DEVELOPMENT NOTES
-- ============================================================================
-- To use this seed file effectively:
--
-- 1. Local Development with Supabase CLI:
--    - Run `supabase start` to start local Supabase
--    - Run `supabase db reset` to apply migrations and run this seed
--
-- 2. Remote Development Database:
--    - Create a development project at supabase.com
--    - Push migrations: supabase db push --db-url "postgres://..."
--    - Run seed manually if needed
--
-- 3. Creating Test Users:
--    - Use Supabase Dashboard > Authentication > Users > Add User
--    - Or use the Auth API
--    - Profiles are created automatically via database trigger
--
-- 4. Uncomment sections above to populate with sample data

SELECT 'Seed file loaded successfully. Uncomment sections as needed for test data.' AS status;
