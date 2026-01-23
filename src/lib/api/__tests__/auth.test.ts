/**
 * API Validation Tests
 *
 * Tests for API authentication and validation utilities.
 */

import { validators, generateApiKey } from '../auth';

describe('API Validators', () => {
  describe('isValidUrl', () => {
    it('should accept valid HTTP URLs', () => {
      expect(validators.isValidUrl('http://example.com')).toBe(true);
      expect(validators.isValidUrl('http://example.com/path')).toBe(true);
      expect(validators.isValidUrl('http://example.com:8080')).toBe(true);
    });

    it('should accept valid HTTPS URLs', () => {
      expect(validators.isValidUrl('https://example.com')).toBe(true);
      expect(validators.isValidUrl('https://example.com/path?query=1')).toBe(true);
      expect(validators.isValidUrl('https://sub.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validators.isValidUrl('not-a-url')).toBe(false);
      expect(validators.isValidUrl('ftp://example.com')).toBe(false);
      expect(validators.isValidUrl('javascript:alert(1)')).toBe(false);
      expect(validators.isValidUrl('')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(validators.isValidUrl('http://')).toBe(false);
      expect(validators.isValidUrl('://example.com')).toBe(false);
    });
  });

  describe('isValidHexColor', () => {
    it('should accept valid hex colors', () => {
      expect(validators.isValidHexColor('#000000')).toBe(true);
      expect(validators.isValidHexColor('#FFFFFF')).toBe(true);
      expect(validators.isValidHexColor('#ff5733')).toBe(true);
      expect(validators.isValidHexColor('#ABC123')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(validators.isValidHexColor('000000')).toBe(false); // Missing #
      expect(validators.isValidHexColor('#FFF')).toBe(false); // Too short
      expect(validators.isValidHexColor('#GGGGGG')).toBe(false); // Invalid chars
      expect(validators.isValidHexColor('#12345')).toBe(false); // Wrong length
      expect(validators.isValidHexColor('')).toBe(false);
    });
  });

  describe('isValidContentType', () => {
    const validTypes = [
      // Basic types
      'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
      // Simple URL types
      'whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'snapchat', 'threads', 'apps',
      // Reviews
      'google-review',
      // File upload types
      'pdf', 'images', 'video', 'mp3',
      // Landing page types
      'menu', 'business', 'links', 'coupon', 'social',
    ];

    it('should accept all valid content types', () => {
      validTypes.forEach((type) => {
        expect(validators.isValidContentType(type)).toBe(true);
      });
    });

    it('should count exactly 26 valid content types', () => {
      // 7 basic + 9 social + 1 reviews + 4 file + 5 landing = 26
      expect(validTypes.length).toBe(26);
    });

    it('should reject invalid content types', () => {
      expect(validators.isValidContentType('invalid')).toBe(false);
      expect(validators.isValidContentType('')).toBe(false);
      expect(validators.isValidContentType('URL')).toBe(false); // Case sensitive
    });
  });

  describe('isValidQRType', () => {
    it('should accept valid QR types', () => {
      expect(validators.isValidQRType('static')).toBe(true);
      expect(validators.isValidQRType('dynamic')).toBe(true);
    });

    it('should reject invalid QR types', () => {
      expect(validators.isValidQRType('invalid')).toBe(false);
      expect(validators.isValidQRType('Static')).toBe(false);
      expect(validators.isValidQRType('')).toBe(false);
    });
  });

  describe('isValidErrorCorrectionLevel', () => {
    it('should accept valid error correction levels', () => {
      expect(validators.isValidErrorCorrectionLevel('L')).toBe(true);
      expect(validators.isValidErrorCorrectionLevel('M')).toBe(true);
      expect(validators.isValidErrorCorrectionLevel('Q')).toBe(true);
      expect(validators.isValidErrorCorrectionLevel('H')).toBe(true);
    });

    it('should reject invalid error correction levels', () => {
      expect(validators.isValidErrorCorrectionLevel('l')).toBe(false); // Case sensitive
      expect(validators.isValidErrorCorrectionLevel('X')).toBe(false);
      expect(validators.isValidErrorCorrectionLevel('')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should pass through safe filenames', () => {
      expect(validators.sanitizeFilename('document.pdf')).toBe('document.pdf');
      expect(validators.sanitizeFilename('my-file_123.txt')).toBe('my-file_123.txt');
    });

    it('should remove path traversal attempts', () => {
      expect(validators.sanitizeFilename('../etc/passwd')).toBe('etcpasswd');
      expect(validators.sanitizeFilename('..\\windows\\system32')).toBe('windowssystem32');
    });

    it('should remove dangerous characters', () => {
      expect(validators.sanitizeFilename('file<script>.txt')).toBe('filescript.txt');
      expect(validators.sanitizeFilename('file"name".txt')).toBe('filename.txt');
      expect(validators.sanitizeFilename('file|name.txt')).toBe('filename.txt');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(200);
      expect(validators.sanitizeFilename(longName).length).toBe(100);
    });
  });

  describe('isValidISODate', () => {
    it('should accept valid ISO dates', () => {
      expect(validators.isValidISODate('2024-01-15T12:00:00Z')).toBe(true);
      expect(validators.isValidISODate('2024-01-15')).toBe(true);
      expect(validators.isValidISODate('2024-01-15T12:00:00.000Z')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(validators.isValidISODate('not-a-date')).toBe(false);
      expect(validators.isValidISODate('')).toBe(false);
      expect(validators.isValidISODate('2024-13-45')).toBe(false); // Invalid month/day
    });
  });

  describe('validateStringLength', () => {
    it('should validate string lengths correctly', () => {
      expect(validators.validateStringLength('hello', 10)).toBe(true);
      expect(validators.validateStringLength('hello', 5)).toBe(true);
      expect(validators.validateStringLength('hello', 4)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validators.validateStringLength('', 0)).toBe(true);
      expect(validators.validateStringLength('a', 0)).toBe(false);
    });
  });

  describe('validateContent', () => {
    describe('URL content', () => {
      it('should validate valid URL content', () => {
        const result = validators.validateContent({ url: 'https://example.com' }, 'url');
        expect(result.valid).toBe(true);
      });

      it('should reject missing URL', () => {
        const result = validators.validateContent({}, 'url');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('url is required');
      });

      it('should reject invalid URL', () => {
        const result = validators.validateContent({ url: 'not-a-url' }, 'url');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid URL');
      });
    });

    describe('text content', () => {
      it('should validate valid text content', () => {
        const result = validators.validateContent({ text: 'Hello World' }, 'text');
        expect(result.valid).toBe(true);
      });

      it('should reject missing text', () => {
        const result = validators.validateContent({}, 'text');
        expect(result.valid).toBe(false);
      });
    });

    describe('WiFi content', () => {
      it('should validate valid WiFi content', () => {
        const result = validators.validateContent(
          { ssid: 'MyNetwork', password: 'pass123', encryption: 'WPA' },
          'wifi'
        );
        expect(result.valid).toBe(true);
      });

      it('should reject missing SSID', () => {
        const result = validators.validateContent({ password: 'pass' }, 'wifi');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('ssid is required');
      });

      it('should reject invalid encryption type', () => {
        const result = validators.validateContent(
          { ssid: 'Network', encryption: 'INVALID' },
          'wifi'
        );
        expect(result.valid).toBe(false);
        expect(result.error).toContain('encryption');
      });
    });

    describe('vCard content', () => {
      it('should validate vCard with name', () => {
        const result = validators.validateContent(
          { firstName: 'John', lastName: 'Doe' },
          'vcard'
        );
        expect(result.valid).toBe(true);
      });

      it('should validate vCard with organization only', () => {
        const result = validators.validateContent(
          { organization: 'Acme Inc' },
          'vcard'
        );
        expect(result.valid).toBe(true);
      });

      it('should reject vCard without name or organization', () => {
        const result = validators.validateContent({}, 'vcard');
        expect(result.valid).toBe(false);
      });
    });

    describe('email content', () => {
      it('should validate valid email', () => {
        const result = validators.validateContent({ email: 'test@example.com' }, 'email');
        expect(result.valid).toBe(true);
      });

      it('should reject invalid email format', () => {
        const result = validators.validateContent({ email: 'not-an-email' }, 'email');
        expect(result.valid).toBe(false);
      });
    });

    describe('phone/sms content', () => {
      it('should validate phone content', () => {
        const result = validators.validateContent({ phone: '+1234567890' }, 'phone');
        expect(result.valid).toBe(true);
      });

      it('should validate SMS content', () => {
        const result = validators.validateContent({ phone: '+1234567890' }, 'sms');
        expect(result.valid).toBe(true);
      });
    });

    describe('WhatsApp content', () => {
      it('should validate WhatsApp content', () => {
        const result = validators.validateContent({ phone: '+1234567890' }, 'whatsapp');
        expect(result.valid).toBe(true);
      });

      it('should reject missing phone', () => {
        const result = validators.validateContent({}, 'whatsapp');
        expect(result.valid).toBe(false);
      });
    });

    describe('unknown content type', () => {
      it('should reject unknown content types', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = validators.validateContent({}, 'unknown' as any);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unknown content type');
      });
    });
  });
});

describe('API Key Generation', () => {
  describe('generateApiKey', () => {
    it('should generate a key with correct prefix', () => {
      const { key } = generateApiKey();
      expect(key.startsWith('qrw_')).toBe(true);
    });

    it('should generate a key with correct length', () => {
      const { key } = generateApiKey();
      // 'qrw_' (4) + 64 hex chars (32 bytes) = 68 chars
      expect(key.length).toBe(68);
    });

    it('should generate a valid SHA-256 hash', () => {
      const { keyHash } = generateApiKey();
      // SHA-256 produces 64 hex characters
      expect(keyHash.length).toBe(64);
      expect(/^[a-f0-9]+$/.test(keyHash)).toBe(true);
    });

    it('should generate a prefix of 8 characters or less', () => {
      const { key, keyPrefix } = generateApiKey();
      expect(keyPrefix.length).toBeLessThanOrEqual(8);
      expect(keyPrefix).toBe(key.substring(0, 8)); // First 8 chars of key
    });

    it('should generate unique keys', () => {
      const keys = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const { key } = generateApiKey();
        keys.add(key);
      }
      expect(keys.size).toBe(100);
    });

    it('should generate unique hashes', () => {
      const hashes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const { keyHash } = generateApiKey();
        hashes.add(keyHash);
      }
      expect(hashes.size).toBe(100);
    });
  });
});
