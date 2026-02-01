export interface ScanData {
  qr_code_id?: string;
  scanned_at: string;
  ip_hash?: string;
  device_type?: string;
  os?: string;
  browser?: string;
  country?: string;
  city?: string;
  region?: string;
  referrer?: string;
}
