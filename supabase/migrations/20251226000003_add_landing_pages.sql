-- Add landing page fields to qr_codes table
-- Allows Business users to show a branded page before redirecting

ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS show_landing_page BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS landing_page_title VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS landing_page_description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS landing_page_logo_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS landing_page_button_text VARCHAR(100) DEFAULT 'Continue',
ADD COLUMN IF NOT EXISTS landing_page_theme VARCHAR(20) DEFAULT 'dark';

-- Add comment for documentation
COMMENT ON COLUMN qr_codes.show_landing_page IS 'Whether to show branded landing page before redirect (Business tier)';
COMMENT ON COLUMN qr_codes.landing_page_title IS 'Title shown on landing page';
COMMENT ON COLUMN qr_codes.landing_page_description IS 'Description/message shown on landing page';
COMMENT ON COLUMN qr_codes.landing_page_logo_url IS 'Logo URL for landing page';
COMMENT ON COLUMN qr_codes.landing_page_button_text IS 'Call-to-action button text';
COMMENT ON COLUMN qr_codes.landing_page_theme IS 'Theme: dark or light';
