/**
 * QR Generation Tests
 *
 * Tests for QR code content generation and validation.
 */

import { contentToString, validateContent } from '../generator';
import type {
  URLContent,
  TextContent,
  WiFiContent,
  VCardContent,
  EmailContent,
  PhoneContent,
  SMSContent,
  WhatsAppContent,
  FacebookContent,
  InstagramContent,
  AppsContent,
} from '../types';

describe('QR Content Generation', () => {
  describe('contentToString - URL', () => {
    it('should return URL as-is', () => {
      const content: URLContent = { type: 'url', url: 'https://example.com' };
      expect(contentToString(content)).toBe('https://example.com');
    });

    it('should handle URLs with paths and query params', () => {
      const content: URLContent = {
        type: 'url',
        url: 'https://example.com/path?query=value&foo=bar',
      };
      expect(contentToString(content)).toBe('https://example.com/path?query=value&foo=bar');
    });
  });

  describe('contentToString - Text', () => {
    it('should return text as-is', () => {
      const content: TextContent = { type: 'text', text: 'Hello, World!' };
      expect(contentToString(content)).toBe('Hello, World!');
    });

    it('should handle special characters', () => {
      const content: TextContent = { type: 'text', text: 'Special: <>&"\'' };
      expect(contentToString(content)).toBe('Special: <>&"\'');
    });

    it('should handle multiline text', () => {
      const content: TextContent = { type: 'text', text: 'Line 1\nLine 2\nLine 3' };
      expect(contentToString(content)).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('contentToString - WiFi', () => {
    it('should generate correct WiFi string for WPA', () => {
      const content: WiFiContent = {
        type: 'wifi',
        ssid: 'MyNetwork',
        password: 'mypassword',
        encryption: 'WPA',
        hidden: false,
      };
      expect(contentToString(content)).toBe('WIFI:T:WPA;S:MyNetwork;P:mypassword;H:false;;');
    });

    it('should generate correct WiFi string for WEP', () => {
      const content: WiFiContent = {
        type: 'wifi',
        ssid: 'OldNetwork',
        password: 'wepkey',
        encryption: 'WEP',
        hidden: false,
      };
      expect(contentToString(content)).toBe('WIFI:T:WEP;S:OldNetwork;P:wepkey;H:false;;');
    });

    it('should generate correct WiFi string for open network', () => {
      const content: WiFiContent = {
        type: 'wifi',
        ssid: 'OpenNetwork',
        password: '',
        encryption: 'nopass',
        hidden: false,
      };
      expect(contentToString(content)).toBe('WIFI:T:nopass;S:OpenNetwork;P:;H:false;;');
    });

    it('should handle hidden networks', () => {
      const content: WiFiContent = {
        type: 'wifi',
        ssid: 'HiddenNetwork',
        password: 'secret',
        encryption: 'WPA',
        hidden: true,
      };
      expect(contentToString(content)).toBe('WIFI:T:WPA;S:HiddenNetwork;P:secret;H:true;;');
    });

    it('should escape special characters in SSID', () => {
      const content: WiFiContent = {
        type: 'wifi',
        ssid: 'Net;work:Name',
        password: 'pass',
        encryption: 'WPA',
        hidden: false,
      };
      const result = contentToString(content);
      expect(result).toContain('Net\\;work\\:Name');
    });

    it('should escape special characters in password', () => {
      const content: WiFiContent = {
        type: 'wifi',
        ssid: 'Network',
        password: 'pass;word:123',
        encryption: 'WPA',
        hidden: false,
      };
      const result = contentToString(content);
      expect(result).toContain('pass\\;word\\:123');
    });
  });

  describe('contentToString - vCard', () => {
    it('should generate valid vCard 3.0', () => {
      const content: VCardContent = {
        type: 'vcard',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        organization: 'Acme Inc',
        title: 'Developer',
        url: 'https://example.com',
      };

      const result = contentToString(content);

      expect(result).toContain('BEGIN:VCARD');
      expect(result).toContain('VERSION:3.0');
      expect(result).toContain('N:Doe;John;;;');
      expect(result).toContain('FN:John Doe');
      expect(result).toContain('ORG:Acme Inc');
      expect(result).toContain('TITLE:Developer');
      expect(result).toContain('TEL:+1234567890');
      expect(result).toContain('EMAIL:john@example.com');
      expect(result).toContain('URL:https://example.com');
      expect(result).toContain('END:VCARD');
    });

    it('should handle minimal vCard', () => {
      const content: VCardContent = {
        type: 'vcard',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = contentToString(content);

      expect(result).toContain('BEGIN:VCARD');
      expect(result).toContain('N:Smith;Jane;;;');
      expect(result).toContain('FN:Jane Smith');
      expect(result).not.toContain('TEL:');
      expect(result).not.toContain('EMAIL:');
      expect(result).toContain('END:VCARD');
    });
  });

  describe('contentToString - Email', () => {
    it('should generate mailto link', () => {
      const content: EmailContent = {
        type: 'email',
        email: 'test@example.com',
      };
      expect(contentToString(content)).toBe('mailto:test@example.com');
    });

    it('should include subject', () => {
      const content: EmailContent = {
        type: 'email',
        email: 'test@example.com',
        subject: 'Hello World',
      };
      expect(contentToString(content)).toBe('mailto:test@example.com?subject=Hello%20World');
    });

    it('should include body', () => {
      const content: EmailContent = {
        type: 'email',
        email: 'test@example.com',
        body: 'This is the email body',
      };
      expect(contentToString(content)).toBe('mailto:test@example.com?body=This%20is%20the%20email%20body');
    });

    it('should include both subject and body', () => {
      const content: EmailContent = {
        type: 'email',
        email: 'test@example.com',
        subject: 'Subject',
        body: 'Body',
      };
      const result = contentToString(content);
      expect(result).toContain('mailto:test@example.com');
      expect(result).toContain('subject=Subject');
      expect(result).toContain('body=Body');
    });
  });

  describe('contentToString - Phone', () => {
    it('should generate tel link', () => {
      const content: PhoneContent = {
        type: 'phone',
        phone: '+1234567890',
      };
      expect(contentToString(content)).toBe('tel:+1234567890');
    });
  });

  describe('contentToString - SMS', () => {
    it('should generate sms link without message', () => {
      const content: SMSContent = {
        type: 'sms',
        phone: '+1234567890',
      };
      expect(contentToString(content)).toBe('sms:+1234567890');
    });

    it('should generate sms link with message', () => {
      const content: SMSContent = {
        type: 'sms',
        phone: '+1234567890',
        message: 'Hello!',
      };
      expect(contentToString(content)).toBe('sms:+1234567890?body=Hello!');
    });
  });

  describe('contentToString - WhatsApp', () => {
    it('should generate WhatsApp link', () => {
      const content: WhatsAppContent = {
        type: 'whatsapp',
        phone: '+1234567890',
      };
      expect(contentToString(content)).toBe('https://wa.me/1234567890');
    });

    it('should strip non-numeric characters from phone', () => {
      const content: WhatsAppContent = {
        type: 'whatsapp',
        phone: '+1 (234) 567-890',
      };
      expect(contentToString(content)).toBe('https://wa.me/1234567890');
    });

    it('should include message', () => {
      const content: WhatsAppContent = {
        type: 'whatsapp',
        phone: '+1234567890',
        message: 'Hello there!',
      };
      expect(contentToString(content)).toBe('https://wa.me/1234567890?text=Hello%20there!');
    });
  });

  describe('contentToString - Facebook', () => {
    it('should return profile URL', () => {
      const content: FacebookContent = {
        type: 'facebook',
        profileUrl: 'https://facebook.com/username',
      };
      expect(contentToString(content)).toBe('https://facebook.com/username');
    });
  });

  describe('contentToString - Instagram', () => {
    it('should generate Instagram URL from username', () => {
      const content: InstagramContent = {
        type: 'instagram',
        username: 'myusername',
      };
      expect(contentToString(content)).toBe('https://instagram.com/myusername');
    });

    it('should strip @ from username', () => {
      const content: InstagramContent = {
        type: 'instagram',
        username: '@myusername',
      };
      expect(contentToString(content)).toBe('https://instagram.com/myusername');
    });
  });

  describe('contentToString - Apps', () => {
    it('should return fallback URL if provided', () => {
      const content: AppsContent = {
        type: 'apps',
        appStoreUrl: 'https://apps.apple.com/app/123',
        playStoreUrl: 'https://play.google.com/app/123',
        fallbackUrl: 'https://example.com/app',
      };
      expect(contentToString(content)).toBe('https://example.com/app');
    });

    it('should return App Store URL if no fallback', () => {
      const content: AppsContent = {
        type: 'apps',
        appStoreUrl: 'https://apps.apple.com/app/123',
        playStoreUrl: 'https://play.google.com/app/123',
      };
      expect(contentToString(content)).toBe('https://apps.apple.com/app/123');
    });

    it('should return Play Store URL if only that is provided', () => {
      const content: AppsContent = {
        type: 'apps',
        playStoreUrl: 'https://play.google.com/app/123',
      };
      expect(contentToString(content)).toBe('https://play.google.com/app/123');
    });
  });
});

describe('QR Content Validation', () => {
  describe('validateContent - URL', () => {
    it('should validate valid URL', () => {
      const result = validateContent({ type: 'url', url: 'https://example.com' });
      expect(result.valid).toBe(true);
    });

    it('should reject missing URL', () => {
      const result = validateContent({ type: 'url', url: '' } as URLContent);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept URL without protocol', () => {
      const result = validateContent({ type: 'url', url: 'example.com' });
      expect(result.valid).toBe(true);
    });

    it('should reject URL without domain', () => {
      const result = validateContent({ type: 'url', url: 'notaurl' });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateContent - Text', () => {
    it('should validate text', () => {
      const result = validateContent({ type: 'text', text: 'Hello' });
      expect(result.valid).toBe(true);
    });

    it('should reject empty text', () => {
      const result = validateContent({ type: 'text', text: '' } as TextContent);
      expect(result.valid).toBe(false);
    });

    it('should reject text that is too long', () => {
      const result = validateContent({ type: 'text', text: 'a'.repeat(3000) });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });
  });

  describe('validateContent - WiFi', () => {
    it('should validate WiFi with SSID', () => {
      const result = validateContent({
        type: 'wifi',
        ssid: 'Network',
        password: 'pass',
        encryption: 'WPA',
        hidden: false,
      });
      expect(result.valid).toBe(true);
    });

    it('should reject WiFi without SSID', () => {
      const result = validateContent({
        type: 'wifi',
        ssid: '',
        password: 'pass',
        encryption: 'WPA',
        hidden: false,
      } as WiFiContent);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('validateContent - vCard', () => {
    it('should validate vCard with name', () => {
      const result = validateContent({
        type: 'vcard',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject vCard without name', () => {
      const result = validateContent({
        type: 'vcard',
        firstName: '',
        lastName: '',
      } as VCardContent);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('validateContent - Email', () => {
    it('should validate email', () => {
      const result = validateContent({ type: 'email', email: 'test@example.com' });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateContent({ type: 'email', email: 'not-an-email' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('validateContent - Phone', () => {
    it('should validate phone', () => {
      const result = validateContent({ type: 'phone', phone: '+1234567890' });
      expect(result.valid).toBe(true);
    });

    it('should reject missing phone', () => {
      const result = validateContent({ type: 'phone', phone: '' } as PhoneContent);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateContent - SMS', () => {
    it('should validate SMS', () => {
      const result = validateContent({ type: 'sms', phone: '+1234567890' });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateContent - WhatsApp', () => {
    it('should validate WhatsApp', () => {
      const result = validateContent({ type: 'whatsapp', phone: '+1234567890' });
      expect(result.valid).toBe(true);
    });

    it('should reject missing phone', () => {
      const result = validateContent({ type: 'whatsapp', phone: '' } as WhatsAppContent);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateContent - Facebook', () => {
    it('should validate Facebook URL', () => {
      const result = validateContent({
        type: 'facebook',
        profileUrl: 'https://facebook.com/user',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject non-Facebook URL', () => {
      const result = validateContent({
        type: 'facebook',
        profileUrl: 'https://example.com/user',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid Facebook');
    });
  });

  describe('validateContent - Instagram', () => {
    it('should validate Instagram username', () => {
      const result = validateContent({ type: 'instagram', username: 'user' });
      expect(result.valid).toBe(true);
    });

    it('should reject missing username', () => {
      const result = validateContent({ type: 'instagram', username: '' } as InstagramContent);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateContent - Apps', () => {
    it('should validate with at least one URL', () => {
      const result = validateContent({
        type: 'apps',
        appStoreUrl: 'https://apps.apple.com/app/123',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject without any URL', () => {
      const result = validateContent({
        type: 'apps',
      } as AppsContent);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateContent - Unknown type', () => {
    it('should reject unknown type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = validateContent({ type: 'unknown' } as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown');
    });
  });
});
