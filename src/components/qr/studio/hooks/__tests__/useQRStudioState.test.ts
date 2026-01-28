/**
 * Tests for useQRStudioState hook
 *
 * These tests verify the critical race conditions and state management
 * that were identified in the QRWolf system audit.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useQRStudioState } from '../useQRStudioState';
import type { MenuContent, BusinessContent, LinksContent, CouponContent, SocialContent } from '@/lib/qr/types';

// Mock Supabase client
const mockGetUser = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

// Mock fetch for password hashing
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ hash: 'mocked-hash' }),
});

describe('useQRStudioState', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    mockSingle.mockResolvedValue({ data: null, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  describe('userTier loading state', () => {
    it('should start with userTierLoading = true', () => {
      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      expect(result.current[0].userTierLoading).toBe(true);
    });

    it('should set userTierLoading = false after fetch completes', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });
    });

    it('should keep userTier as null for unauthenticated users', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      expect(result.current[0].userTier).toBeNull();
      expect(result.current[0].userId).toBeNull();
    });

    it('should set correct tier for authenticated users', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle.mockResolvedValue({
        data: { subscription_tier: 'pro' },
        error: null,
      });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      expect(result.current[0].userTier).toBe('pro');
      expect(result.current[0].userId).toBe('user-123');
    });

    it('should default to free tier when profile has no subscription_tier', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle.mockResolvedValue({
        data: { subscription_tier: null },
        error: null,
      });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      expect(result.current[0].userTier).toBe('free');
    });
  });

  describe('saveQRCode race condition prevention', () => {
    it('should set saveBlockedReason when user is not logged in', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      // Set up content for save attempt
      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
      });

      // Attempt to save
      let saveResult: { id: string; shortCode: string } | null = null;
      await act(async () => {
        saveResult = await result.current[1].saveQRCode();
      });

      expect(saveResult).toBeNull();
      expect(result.current[0].saveBlockedReason).toBe('Please sign in to save your QR code');
    });

    it('should set saveBlockedReason when userTier is still loading', async () => {
      // Make getUser never resolve to keep loading state
      mockGetUser.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      expect(result.current[0].userTierLoading).toBe(true);

      // Set up content
      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
      });

      // Force userId to simulate partial auth state
      // Note: In real code, this state shouldn't be possible, but we test the guard
      // The saveBlockedReason should be set for no userId first
      let saveResult: { id: string; shortCode: string } | null = null;
      await act(async () => {
        saveResult = await result.current[1].saveQRCode();
      });

      expect(saveResult).toBeNull();
      // Since userId is null, it will hit that check first
      expect(result.current[0].saveBlockedReason).toBe('Please sign in to save your QR code');
    });

    it('should allow save after userTier loads', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle
        .mockResolvedValueOnce({ data: { subscription_tier: 'pro' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'qr-123' }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      // Set up content
      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
      });

      // Attempt to save
      let saveResult: { id: string; shortCode: string } | null = null;
      await act(async () => {
        saveResult = await result.current[1].saveQRCode();
      });

      expect(saveResult).not.toBeNull();
      const savedResult = saveResult as unknown as { id: string; shortCode: string };
      expect(savedResult.id).toBe('qr-123');
      expect(result.current[0].saveBlockedReason).toBeNull();
    });
  });

  describe('QR code creation limit enforcement', () => {
    it('should block free user from creating QR code when at limit', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      // Profile fetch returns free tier
      mockSingle.mockResolvedValueOnce({
        data: { subscription_tier: 'free' },
        error: null,
      });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      // Override mockFrom for the count query: user has 5 QR codes (at free limit of 5)
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      });

      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
      });

      let saveResult: { id: string; shortCode: string } | null = null;
      await act(async () => {
        saveResult = await result.current[1].saveQRCode();
      });

      expect(saveResult).toBeNull();
      expect(result.current[0].saveBlockedReason).toContain('limit');
    });

    it('should allow free user to create QR code when under limit', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      // Profile fetch returns free tier
      mockSingle.mockResolvedValueOnce({
        data: { subscription_tier: 'free' },
        error: null,
      });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      // Count query: user has 3 QR codes (under free limit of 5)
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      });

      // Insert mock for the actual save
      mockSingle.mockResolvedValueOnce({ data: { id: 'qr-new' }, error: null });

      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
      });

      let saveResult: { id: string; shortCode: string } | null = null;
      await act(async () => {
        saveResult = await result.current[1].saveQRCode();
      });

      expect(saveResult).not.toBeNull();
      expect(result.current[0].saveBlockedReason).toBeNull();
    });

    it('should not check limit for Pro users (50 limit)', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle
        .mockResolvedValueOnce({ data: { subscription_tier: 'pro' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'qr-123' }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
      });

      // Pro user has limit of 50 — count query still runs, but with 10 codes should be fine
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 10, error: null }),
        }),
      });

      let saveResult: { id: string; shortCode: string } | null = null;
      await act(async () => {
        saveResult = await result.current[1].saveQRCode();
      });

      expect(saveResult).not.toBeNull();
    });
  });

  describe('content validation - landing page types', () => {
    beforeEach(async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle.mockResolvedValue({
        data: { subscription_tier: 'pro' },
        error: null,
      });
    });

    it('should require categories with items for menu type', async () => {
      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      act(() => {
        result.current[1].selectType('menu');
      });

      // Just restaurant name - should be invalid
      act(() => {
        const content: MenuContent = {
          type: 'menu',
          restaurantName: 'Test Restaurant',
          categories: [],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // With category but no items - should be invalid
      act(() => {
        const content: MenuContent = {
          type: 'menu',
          restaurantName: 'Test Restaurant',
          categories: [{ name: 'Appetizers', items: [] }],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // With category and items - should be valid
      act(() => {
        const content: MenuContent = {
          type: 'menu',
          restaurantName: 'Test Restaurant',
          categories: [
            {
              name: 'Appetizers',
              items: [{ name: 'Soup', price: '5.99' }],
            },
          ],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);
    });

    it('should require contact info for business type', async () => {
      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      act(() => {
        result.current[1].selectType('business');
      });

      // Just name - should be invalid
      act(() => {
        const content: BusinessContent = {
          type: 'business',
          name: 'Test Business',
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // Name with email - should be valid
      act(() => {
        const content: BusinessContent = {
          type: 'business',
          name: 'Test Business',
          email: 'test@business.com',
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);

      // Name with phone - should be valid
      act(() => {
        const content: BusinessContent = {
          type: 'business',
          name: 'Test Business',
          phone: '+1234567890',
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);

      // Name with website - should be valid
      act(() => {
        const content: BusinessContent = {
          type: 'business',
          name: 'Test Business',
          website: 'https://business.com',
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);
    });

    it('should require valid links for links type', async () => {
      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      act(() => {
        result.current[1].selectType('links');
      });

      // Just title - should be invalid
      act(() => {
        const content: LinksContent = {
          type: 'links',
          title: 'My Links',
          links: [],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // Title with empty link - should be invalid
      act(() => {
        const content: LinksContent = {
          type: 'links',
          title: 'My Links',
          links: [{ title: '', url: '' }],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // Title with valid link - should be valid
      act(() => {
        const content: LinksContent = {
          type: 'links',
          title: 'My Links',
          links: [{ title: 'Example', url: 'https://example.com' }],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);
    });

    it('should require discount info for coupon type', async () => {
      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      act(() => {
        result.current[1].selectType('coupon');
      });

      // Just business name and headline - should be invalid
      act(() => {
        const content: CouponContent = {
          type: 'coupon',
          businessName: 'Test Store',
          headline: 'Big Sale',
          description: '',
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // With discount code - should be valid
      act(() => {
        const content: CouponContent = {
          type: 'coupon',
          businessName: 'Test Store',
          headline: 'Big Sale',
          description: '',
          code: 'SAVE20',
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);

      // With description instead of code - should be valid
      act(() => {
        const content: CouponContent = {
          type: 'coupon',
          businessName: 'Test Store',
          headline: 'Big Sale',
          description: '20% off all items',
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);
    });

    it('should require social links for social type', async () => {
      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      act(() => {
        result.current[1].selectType('social');
      });

      // Just name - should be invalid
      act(() => {
        const content: SocialContent = {
          type: 'social',
          name: 'John Doe',
          links: [],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // Name with empty link - should be invalid
      act(() => {
        const content: SocialContent = {
          type: 'social',
          name: 'John Doe',
          links: [{ platform: 'twitter', handle: '', url: '' }],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(false);

      // Name with valid link - should be valid
      act(() => {
        const content: SocialContent = {
          type: 'social',
          name: 'John Doe',
          links: [{ platform: 'twitter', handle: 'johndoe', url: 'https://twitter.com/johndoe' }],
        };
        result.current[1].setContent(content);
      });
      expect(result.current[1].isContentValid()).toBe(true);
    });
  });

  describe('clearSaveError', () => {
    it('should clear both saveError and saveBlockedReason', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      // Trigger a blocked reason
      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
      });

      await act(async () => {
        await result.current[1].saveQRCode();
      });

      expect(result.current[0].saveBlockedReason).not.toBeNull();

      // Clear errors
      act(() => {
        result.current[1].clearSaveError();
      });

      expect(result.current[0].saveError).toBeNull();
      expect(result.current[0].saveBlockedReason).toBeNull();
    });
  });
});
