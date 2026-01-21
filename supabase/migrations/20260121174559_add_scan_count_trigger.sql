-- Function to increment scan count on qr_codes table
CREATE OR REPLACE FUNCTION increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = NEW.qr_code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incrementing scan count when a new scan is inserted
DROP TRIGGER IF EXISTS on_scan_created ON scans;
CREATE TRIGGER on_scan_created
  AFTER INSERT ON scans
  FOR EACH ROW EXECUTE FUNCTION increment_scan_count();
