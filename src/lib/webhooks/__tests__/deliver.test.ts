/**
 * Webhook Delivery Engine Tests
 *
 * Tests for core webhook delivery functions:
 * - Secret generation
 * - Payload signing
 * - Retry delay calculation
 * - Payload building
 * - URL validation
 */

import { generateWebhookSecret, signPayload, calculateNextRetry, buildWebhookPayload, isValidWebhookUrl } from '../deliver';

describe('Webhook Delivery Engine', () => {
  describe('generateWebhookSecret', () => {
    it('should generate a 64-character hex string', () => {
      const secret = generateWebhookSecret();
      expect(secret).toHaveLength(64);
      expect(secret).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate unique secrets', () => {
      const secret1 = generateWebhookSecret();
      const secret2 = generateWebhookSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('signPayload', () => {
    it('should produce a consistent HMAC-SHA256 signature', () => {
      const payload = '{"event":"scan"}';
      const secret = 'test-secret-123';
      const timestamp = 1706745600;

      const sig1 = signPayload(payload, secret, timestamp);
      const sig2 = signPayload(payload, secret, timestamp);

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce different signatures for different payloads', () => {
      const secret = 'test-secret';
      const timestamp = 1706745600;

      const sig1 = signPayload('{"event":"scan"}', secret, timestamp);
      const sig2 = signPayload('{"event":"test"}', secret, timestamp);

      expect(sig1).not.toBe(sig2);
    });

    it('should produce different signatures for different secrets', () => {
      const payload = '{"event":"scan"}';
      const timestamp = 1706745600;

      const sig1 = signPayload(payload, 'secret-1', timestamp);
      const sig2 = signPayload(payload, 'secret-2', timestamp);

      expect(sig1).not.toBe(sig2);
    });

    it('should produce different signatures for different timestamps', () => {
      const payload = '{"event":"scan"}';
      const secret = 'test-secret';

      const sig1 = signPayload(payload, secret, 1000);
      const sig2 = signPayload(payload, secret, 2000);

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('calculateNextRetry', () => {
    it('should return 30 seconds for attempt 1', () => {
      const before = Date.now();
      const retry = calculateNextRetry(1);
      const after = Date.now();

      const delayMs = retry.getTime() - before;
      expect(delayMs).toBeGreaterThanOrEqual(29000);
      expect(delayMs).toBeLessThanOrEqual(31000 + (after - before));
    });

    it('should return 2 minutes for attempt 2', () => {
      const before = Date.now();
      const retry = calculateNextRetry(2);

      const delayMs = retry.getTime() - before;
      expect(delayMs).toBeGreaterThanOrEqual(119000);
      expect(delayMs).toBeLessThanOrEqual(121000);
    });

    it('should return 15 minutes for attempt 3', () => {
      const before = Date.now();
      const retry = calculateNextRetry(3);

      const delayMs = retry.getTime() - before;
      expect(delayMs).toBeGreaterThanOrEqual(899000);
      expect(delayMs).toBeLessThanOrEqual(901000);
    });

    it('should return 1 hour for attempt 4', () => {
      const before = Date.now();
      const retry = calculateNextRetry(4);

      const delayMs = retry.getTime() - before;
      expect(delayMs).toBeGreaterThanOrEqual(3599000);
      expect(delayMs).toBeLessThanOrEqual(3601000);
    });

    it('should return 4 hours for attempt 5', () => {
      const before = Date.now();
      const retry = calculateNextRetry(5);

      const delayMs = retry.getTime() - before;
      expect(delayMs).toBeGreaterThanOrEqual(14399000);
      expect(delayMs).toBeLessThanOrEqual(14401000);
    });

    it('should cap at 4 hours for attempts beyond 5', () => {
      const before = Date.now();
      const retry = calculateNextRetry(10);

      const delayMs = retry.getTime() - before;
      expect(delayMs).toBeGreaterThanOrEqual(14399000);
      expect(delayMs).toBeLessThanOrEqual(14401000);
    });
  });

  describe('buildWebhookPayload', () => {
    it('should build a correctly structured payload', () => {
      const payload = buildWebhookPayload(
        'delivery-123',
        'scan-456',
        {
          scanned_at: '2026-01-31T14:23:00.000Z',
          device_type: 'mobile',
          os: 'iOS',
          browser: 'Safari',
          country: 'United States',
          city: 'San Francisco',
          region: 'California',
        },
        {
          id: 'qr-789',
          name: 'My QR Code',
          short_code: 'aBcDeFg',
          content_type: 'url',
        }
      );

      expect(payload.event).toBe('scan');
      expect(payload.delivery_id).toBe('delivery-123');
      expect(payload.timestamp).toBeDefined();
      expect(new Date(payload.timestamp).getTime()).not.toBeNaN();

      expect(payload.qr_code).toEqual({
        id: 'qr-789',
        name: 'My QR Code',
        short_code: 'aBcDeFg',
        content_type: 'url',
      });

      expect(payload.scan).toEqual({
        id: 'scan-456',
        scanned_at: '2026-01-31T14:23:00.000Z',
        device_type: 'mobile',
        os: 'iOS',
        browser: 'Safari',
        country: 'United States',
        city: 'San Francisco',
        region: 'California',
      });
    });

    it('should handle null scan fields', () => {
      const payload = buildWebhookPayload(
        'delivery-123',
        'scan-456',
        {
          scanned_at: '2026-01-31T14:23:00.000Z',
          device_type: null,
          os: null,
          browser: null,
          country: null,
          city: null,
          region: null,
        },
        {
          id: 'qr-789',
          name: 'Test',
          short_code: null,
          content_type: 'text',
        }
      );

      expect(payload.scan.device_type).toBeNull();
      expect(payload.scan.os).toBeNull();
      expect(payload.scan.browser).toBeNull();
      expect(payload.scan.country).toBeNull();
      expect(payload.qr_code.short_code).toBeNull();
    });
  });

  describe('isValidWebhookUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(isValidWebhookUrl('https://example.com/webhook')).toEqual({ valid: true });
      expect(isValidWebhookUrl('https://api.mysite.com/hooks/qr')).toEqual({ valid: true });
      expect(isValidWebhookUrl('https://webhook.site/abc-123')).toEqual({ valid: true });
    });

    it('should reject HTTP URLs', () => {
      const result = isValidWebhookUrl('http://example.com/webhook');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HTTPS');
    });

    it('should reject localhost', () => {
      expect(isValidWebhookUrl('https://localhost/webhook').valid).toBe(false);
      expect(isValidWebhookUrl('https://127.0.0.1/webhook').valid).toBe(false);
      expect(isValidWebhookUrl('https://::1/webhook').valid).toBe(false);
    });

    it('should reject private IP ranges', () => {
      expect(isValidWebhookUrl('https://10.0.0.1/webhook').valid).toBe(false);
      expect(isValidWebhookUrl('https://172.16.0.1/webhook').valid).toBe(false);
      expect(isValidWebhookUrl('https://192.168.1.1/webhook').valid).toBe(false);
      expect(isValidWebhookUrl('https://169.254.0.1/webhook').valid).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isValidWebhookUrl('not-a-url').valid).toBe(false);
      expect(isValidWebhookUrl('').valid).toBe(false);
      expect(isValidWebhookUrl('ftp://example.com').valid).toBe(false);
    });

    it('should reject non-HTTP schemes', () => {
      expect(isValidWebhookUrl('javascript:alert(1)').valid).toBe(false);
      expect(isValidWebhookUrl('data:text/html,test').valid).toBe(false);
    });
  });
});
