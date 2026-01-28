/**
 * Subscription Plans Tests
 *
 * Tests for subscription tier limits and feature gating.
 */

import { PLANS, SCAN_LIMITS, getScanLimit, isWithinScanLimit, getQRCodeLimit, isWithinQRCodeLimit } from '../plans';

describe('Subscription Plans', () => {
  describe('Plan Configuration', () => {
    it('should have all three tiers defined', () => {
      expect(PLANS.free).toBeDefined();
      expect(PLANS.pro).toBeDefined();
      expect(PLANS.business).toBeDefined();
    });

    it('should have correct names', () => {
      expect(PLANS.free.name).toBe('Free');
      expect(PLANS.pro.name).toBe('Pro');
      expect(PLANS.business.name).toBe('Business');
    });

    it('should have free tier at $0', () => {
      expect(PLANS.free.price).toBe(0);
    });

    it('should have correct Pro pricing', () => {
      expect(PLANS.pro.monthlyPrice).toBe(9);
      expect(PLANS.pro.yearlyPrice).toBe(90);
    });

    it('should have correct Business pricing', () => {
      expect(PLANS.business.monthlyPrice).toBe(29);
      expect(PLANS.business.yearlyPrice).toBe(290);
    });
  });

  describe('Scan Limits', () => {
    it('should have correct free tier scan limit', () => {
      expect(SCAN_LIMITS.free).toBe(100);
    });

    it('should have correct pro tier scan limit', () => {
      expect(SCAN_LIMITS.pro).toBe(10000);
    });

    it('should have unlimited business tier scans', () => {
      expect(SCAN_LIMITS.business).toBe(-1);
    });
  });

  describe('QR Code Limits', () => {
    it('should have 5 QR codes for free tier', () => {
      expect(PLANS.free.dynamicQRLimit).toBe(5);
    });

    it('should have 50 QR codes for pro tier', () => {
      expect(PLANS.pro.dynamicQRLimit).toBe(50);
    });

    it('should have unlimited QR codes for business tier', () => {
      expect(PLANS.business.dynamicQRLimit).toBe(-1);
    });
  });

  describe('getScanLimit', () => {
    it('should return correct limit for free tier', () => {
      expect(getScanLimit('free')).toBe(100);
    });

    it('should return correct limit for pro tier', () => {
      expect(getScanLimit('pro')).toBe(10000);
    });

    it('should return -1 for business tier', () => {
      expect(getScanLimit('business')).toBe(-1);
    });

    it('should default to free tier limit for unknown tier', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getScanLimit('unknown' as any)).toBe(100);
    });
  });

  describe('isWithinScanLimit', () => {
    describe('Free tier', () => {
      it('should allow scans under limit', () => {
        expect(isWithinScanLimit('free', 0)).toBe(true);
        expect(isWithinScanLimit('free', 50)).toBe(true);
        expect(isWithinScanLimit('free', 99)).toBe(true);
      });

      it('should block scans at limit', () => {
        expect(isWithinScanLimit('free', 100)).toBe(false);
      });

      it('should block scans over limit', () => {
        expect(isWithinScanLimit('free', 101)).toBe(false);
        expect(isWithinScanLimit('free', 1000)).toBe(false);
      });
    });

    describe('Pro tier', () => {
      it('should allow scans under limit', () => {
        expect(isWithinScanLimit('pro', 0)).toBe(true);
        expect(isWithinScanLimit('pro', 5000)).toBe(true);
        expect(isWithinScanLimit('pro', 9999)).toBe(true);
      });

      it('should block scans at limit', () => {
        expect(isWithinScanLimit('pro', 10000)).toBe(false);
      });

      it('should block scans over limit', () => {
        expect(isWithinScanLimit('pro', 10001)).toBe(false);
      });
    });

    describe('Business tier', () => {
      it('should always allow scans (unlimited)', () => {
        expect(isWithinScanLimit('business', 0)).toBe(true);
        expect(isWithinScanLimit('business', 1000000)).toBe(true);
        expect(isWithinScanLimit('business', Number.MAX_SAFE_INTEGER)).toBe(true);
      });
    });
  });

  describe('getQRCodeLimit', () => {
    it('should return correct limit for free tier', () => {
      expect(getQRCodeLimit('free')).toBe(5);
    });

    it('should return correct limit for pro tier', () => {
      expect(getQRCodeLimit('pro')).toBe(50);
    });

    it('should return -1 for business tier', () => {
      expect(getQRCodeLimit('business')).toBe(-1);
    });

    it('should default to free tier limit for unknown tier', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getQRCodeLimit('unknown' as any)).toBe(5);
    });
  });

  describe('isWithinQRCodeLimit', () => {
    describe('Free tier', () => {
      it('should allow QR codes under limit', () => {
        expect(isWithinQRCodeLimit('free', 0)).toBe(true);
        expect(isWithinQRCodeLimit('free', 4)).toBe(true);
      });

      it('should block QR codes at limit', () => {
        expect(isWithinQRCodeLimit('free', 5)).toBe(false);
      });

      it('should block QR codes over limit', () => {
        expect(isWithinQRCodeLimit('free', 6)).toBe(false);
        expect(isWithinQRCodeLimit('free', 100)).toBe(false);
      });
    });

    describe('Pro tier', () => {
      it('should allow QR codes under limit', () => {
        expect(isWithinQRCodeLimit('pro', 0)).toBe(true);
        expect(isWithinQRCodeLimit('pro', 49)).toBe(true);
      });

      it('should block QR codes at limit', () => {
        expect(isWithinQRCodeLimit('pro', 50)).toBe(false);
      });

      it('should block QR codes over limit', () => {
        expect(isWithinQRCodeLimit('pro', 51)).toBe(false);
      });
    });

    describe('Business tier', () => {
      it('should always allow QR codes (unlimited)', () => {
        expect(isWithinQRCodeLimit('business', 0)).toBe(true);
        expect(isWithinQRCodeLimit('business', 1000000)).toBe(true);
      });
    });
  });

  describe('Plan Features', () => {
    it('should have features array for each plan', () => {
      expect(Array.isArray(PLANS.free.features)).toBe(true);
      expect(Array.isArray(PLANS.pro.features)).toBe(true);
      expect(Array.isArray(PLANS.business.features)).toBe(true);
    });

    it('should have at least 3 features per plan', () => {
      expect(PLANS.free.features.length).toBeGreaterThanOrEqual(3);
      expect(PLANS.pro.features.length).toBeGreaterThanOrEqual(3);
      expect(PLANS.business.features.length).toBeGreaterThanOrEqual(3);
    });

    describe('Free tier features', () => {
      it('should include QR code limit', () => {
        expect(PLANS.free.features.some(f => f.includes('5 QR codes'))).toBe(true);
      });
    });

    describe('Pro tier features', () => {
      it('should include dynamic QR codes', () => {
        expect(PLANS.pro.features.some(f => f.toLowerCase().includes('dynamic'))).toBe(true);
      });

      it('should include analytics', () => {
        expect(PLANS.pro.features.some(f => f.toLowerCase().includes('analytics'))).toBe(true);
      });

      it('should include custom logo', () => {
        expect(PLANS.pro.features.some(f => f.toLowerCase().includes('logo'))).toBe(true);
      });
    });

    describe('Business tier features', () => {
      it('should include unlimited', () => {
        expect(PLANS.business.features.some(f => f.toLowerCase().includes('unlimited'))).toBe(true);
      });

      it('should include API access', () => {
        expect(PLANS.business.features.some(f => f.toLowerCase().includes('api'))).toBe(true);
      });

      it('should include team members', () => {
        expect(PLANS.business.features.some(f => f.toLowerCase().includes('team'))).toBe(true);
      });
    });
  });
});
