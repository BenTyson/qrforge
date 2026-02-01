/**
 * Test Data Factories
 *
 * Generate mock data for tests. Use these factories instead of
 * creating test data inline to ensure consistency and reduce boilerplate.
 */

import type { Profile, QRCode, Scan, SubscriptionTier } from '../supabase/types';
import type {
  URLContent,
  TextContent,
  WiFiContent,
  VCardContent,
  EmailContent,
  PhoneContent,
  SMSContent,
  QRStyleOptions,
} from '../qr/types';

// Counter for generating unique IDs
let idCounter = 0;

function generateId(): string {
  idCounter++;
  return `test-${idCounter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a mock user profile
 */
export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  const id = overrides.id || generateUUID();
  return {
    id,
    email: `user-${id.substring(0, 8)}@test.com`,
    full_name: 'Test User',
    avatar_url: null,
    stripe_customer_id: null,
    subscription_tier: 'free' as SubscriptionTier,
    subscription_status: null,
    billing_interval: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock QR code
 */
export function createMockQRCode(overrides: Partial<QRCode> = {}): QRCode {
  const id = overrides.id || generateUUID();
  return {
    id,
    user_id: overrides.user_id || generateUUID(),
    name: `Test QR Code ${id.substring(0, 8)}`,
    type: 'static',
    content_type: 'url',
    content: { type: 'url', url: 'https://example.com' },
    short_code: null,
    destination_url: null,
    style: {
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      errorCorrectionLevel: 'M',
      margin: 2,
    },
    scan_count: 0,
    folder_id: null,
    campaign_id: null,
    expires_at: null,
    active_from: null,
    active_until: null,
    bulk_batch_id: null,
    password_hash: null,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock scan
 */
export function createMockScan(overrides: Partial<Scan> = {}): Scan {
  return {
    id: overrides.id || generateUUID(),
    qr_code_id: overrides.qr_code_id || generateUUID(),
    scanned_at: new Date().toISOString(),
    ip_hash: 'abc123def456',
    country: 'US',
    city: 'San Francisco',
    region: 'California',
    device_type: 'mobile',
    os: 'iOS',
    browser: 'Safari',
    referrer: null,
    ...overrides,
  };
}

/**
 * Create a mock API key data
 */
export interface MockApiKey {
  key: string;
  keyHash: string;
  keyPrefix: string;
  userId: string;
  expiresAt: string | null;
  ipWhitelist: string[] | null;
  permissions: string[];
  requestCount: number;
  monthlyRequestCount: number;
  monthlyResetAt: string | null;
  revokedAt: string | null;
}

export function createMockApiKey(overrides: Partial<MockApiKey> = {}): MockApiKey {
  const key = `qrw_test_${generateId()}`;
  return {
    key,
    keyHash: `hash_${key}`,
    keyPrefix: key.substring(0, 8),
    userId: generateUUID(),
    expiresAt: null,
    ipWhitelist: null,
    permissions: ['read', 'write'],
    requestCount: 0,
    monthlyRequestCount: 0,
    monthlyResetAt: null,
    revokedAt: null,
    ...overrides,
  };
}

// === QR Content Factories ===

export function createURLContent(url = 'https://example.com'): URLContent {
  return { type: 'url', url };
}

export function createTextContent(text = 'Hello, World!'): TextContent {
  return { type: 'text', text };
}

export function createWiFiContent(overrides: Partial<Omit<WiFiContent, 'type'>> = {}): WiFiContent {
  return {
    type: 'wifi',
    ssid: 'TestNetwork',
    password: 'password123',
    encryption: 'WPA',
    hidden: false,
    ...overrides,
  };
}

export function createVCardContent(overrides: Partial<Omit<VCardContent, 'type'>> = {}): VCardContent {
  return {
    type: 'vcard',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    organization: 'Test Company',
    title: 'Developer',
    url: 'https://example.com',
    ...overrides,
  };
}

export function createEmailContent(overrides: Partial<Omit<EmailContent, 'type'>> = {}): EmailContent {
  return {
    type: 'email',
    email: 'test@example.com',
    subject: 'Test Subject',
    body: 'Test body content',
    ...overrides,
  };
}

export function createPhoneContent(phone = '+1234567890'): PhoneContent {
  return { type: 'phone', phone };
}

export function createSMSContent(overrides: Partial<Omit<SMSContent, 'type'>> = {}): SMSContent {
  return {
    type: 'sms',
    phone: '+1234567890',
    message: 'Test message',
    ...overrides,
  };
}

// === Style Factories ===

export function createDefaultStyle(): QRStyleOptions {
  return {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
  };
}

export function createCustomStyle(overrides: Partial<QRStyleOptions> = {}): QRStyleOptions {
  return {
    ...createDefaultStyle(),
    ...overrides,
  };
}

// === Batch Factories ===

export function createMockProfiles(count: number, baseOverrides: Partial<Profile> = {}): Profile[] {
  return Array.from({ length: count }, (_, i) =>
    createMockProfile({
      ...baseOverrides,
      email: `user${i + 1}@test.com`,
      full_name: `Test User ${i + 1}`,
    })
  );
}

export function createMockQRCodes(count: number, userId: string, baseOverrides: Partial<QRCode> = {}): QRCode[] {
  return Array.from({ length: count }, (_, i) =>
    createMockQRCode({
      ...baseOverrides,
      user_id: userId,
      name: `Test QR ${i + 1}`,
    })
  );
}

export function createMockScans(count: number, qrCodeId: string, baseOverrides: Partial<Scan> = {}): Scan[] {
  return Array.from({ length: count }, () =>
    createMockScan({
      ...baseOverrides,
      qr_code_id: qrCodeId,
    })
  );
}

// === Reset Functions (for test cleanup) ===

export function resetFactories(): void {
  idCounter = 0;
}
