/**
 * Integration Tests for QR Creation Flow
 *
 * End-to-end tests for the complete QR code creation,
 * save, and redirect workflow.
 */

export {}; // Make this file a module to prevent global scope conflicts

// Mock Supabase
const mockSingle = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: (table: string) => {
      mockFrom(table);
      return {
        select: (fields?: string) => {
          mockSelect(fields);
          return {
            eq: (field: string, value: string) => {
              mockEq(field, value);
              return { single: mockSingle };
            },
          };
        },
        insert: (data: Record<string, unknown>) => {
          mockInsert(data);
          return {
            select: () => ({ single: mockSingle }),
          };
        },
        update: (data: Record<string, unknown>) => {
          mockUpdate(data);
          return {
            eq: () => Promise.resolve({ error: null }),
          };
        },
      };
    },
  }),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: (table: string) => {
      mockFrom(table);
      return {
        select: (fields?: string) => {
          mockSelect(fields);
          return {
            eq: (field: string, value: string) => {
              mockEq(field, value);
              return { single: mockSingle };
            },
          };
        },
      };
    },
  }),
}));

// Mock fetch for password hashing
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ hash: 'mocked-hash' }),
});

import { renderHook, act, waitFor } from '@testing-library/react';
import { useQRStudioState } from '@/components/qr/studio/hooks/useQRStudioState';

describe('QR Creation Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full creation flow for Pro user', () => {
    it('should create QR with type=dynamic for Pro users', async () => {
      // Setup Pro user
      const mockUser = { id: 'pro-user-123', email: 'pro@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle
        .mockResolvedValueOnce({ data: { subscription_tier: 'pro' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'saved-qr-123' }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      // Wait for user data to load
      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      expect(result.current[0].userTier).toBe('pro');

      // Select type and add content
      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
        result.current[1].setQrName('My Pro QR');
      });

      // Save
      let saveResult: { id: string; shortCode: string } | null = null;
      await act(async () => {
        saveResult = await result.current[1].saveQRCode();
      });

      expect(saveResult).not.toBeNull();
      const savedQR = saveResult as unknown as { id: string; shortCode: string };
      expect(savedQR.id).toBe('saved-qr-123');
      expect(savedQR.shortCode).toBeDefined();

      // Verify insert was called with correct data
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dynamic',
          user_id: 'pro-user-123',
          content_type: 'url',
          content: { type: 'url', url: 'https://example.com' },
        })
      );
    });

    it('should create QR with type=dynamic for landing page types', async () => {
      // Setup free user
      const mockUser = { id: 'free-user-123', email: 'free@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle
        .mockResolvedValueOnce({ data: { subscription_tier: 'free' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'saved-menu-123' }, error: null });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'create' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      // Select menu type (requires dynamic)
      act(() => {
        result.current[1].selectType('menu');
        result.current[1].setContent({
          type: 'menu',
          restaurantName: 'Test Restaurant',
          categories: [
            {
              name: 'Appetizers',
              items: [{ name: 'Soup', price: '5.99' }],
            },
          ],
        });
      });

      await act(async () => {
        await result.current[1].saveQRCode();
      });

      // Menu type should always be dynamic
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dynamic',
          content_type: 'menu',
        })
      );
    });
  });

  describe('Short code generation', () => {
    it('should generate unique short_code', async () => {
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

      const saveResult = await act(async () => {
        return await result.current[1].saveQRCode();
      });

      expect(saveResult?.shortCode).toBeDefined();
      expect(saveResult?.shortCode.length).toBe(7);

      // Verify short_code was included in insert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          short_code: expect.any(String),
        })
      );
    });
  });

  describe('Content storage', () => {
    it('should store content correctly for URL type', async () => {
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
        result.current[1].setContent({ type: 'url', url: 'https://test.example.com/page' });
      });

      await act(async () => {
        await result.current[1].saveQRCode();
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          content: { type: 'url', url: 'https://test.example.com/page' },
          destination_url: null, // Dynamic QRs don't use destination_url
        })
      );
    });

    it('should store content correctly for WiFi type', async () => {
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
        result.current[1].selectType('wifi');
        result.current[1].setContent({
          type: 'wifi',
          ssid: 'MyNetwork',
          password: 'secret123',
          encryption: 'WPA',
          hidden: false,
        });
      });

      await act(async () => {
        await result.current[1].saveQRCode();
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          content_type: 'wifi',
          content: {
            type: 'wifi',
            ssid: 'MyNetwork',
            password: 'secret123',
            encryption: 'WPA',
            hidden: false,
          },
        })
      );
    });
  });

  describe('Pro options', () => {
    it('should save expiration date', async () => {
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

      const expirationDate = '2026-12-31T23:59';

      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
        result.current[1].setExpiresAt(expirationDate);
      });

      await act(async () => {
        await result.current[1].saveQRCode();
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          expires_at: expect.any(String),
        })
      );
    });

    it('should save password hash when enabled', async () => {
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
        result.current[1].setPasswordEnabled(true);
        result.current[1].setPassword('secret123');
      });

      await act(async () => {
        await result.current[1].saveQRCode();
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: 'mocked-hash',
        })
      );
    });

    it('should save scheduling options', async () => {
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

      const activeFrom = '2026-06-01T00:00';
      const activeUntil = '2026-12-31T23:59';

      act(() => {
        result.current[1].selectType('url');
        result.current[1].setContent({ type: 'url', url: 'https://example.com' });
        result.current[1].setScheduledEnabled(true);
        result.current[1].setActiveFrom(activeFrom);
        result.current[1].setActiveUntil(activeUntil);
      });

      await act(async () => {
        await result.current[1].saveQRCode();
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          active_from: expect.any(String),
          active_until: expect.any(String),
        })
      );
    });
  });

  describe('Edit mode', () => {
    it('should load existing QR code in edit mode', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle
        .mockResolvedValueOnce({ data: { subscription_tier: 'pro' }, error: null })
        .mockResolvedValueOnce({
          data: {
            id: 'existing-qr-123',
            name: 'Existing QR',
            content_type: 'url',
            content: { type: 'url', url: 'https://original.com' },
            short_code: 'orig123',
            style: { foregroundColor: '#FF0000' },
          },
          error: null,
        });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'edit', qrCodeId: 'existing-qr-123' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      // Load the QR code
      let loadSuccess = false;
      await act(async () => {
        loadSuccess = await result.current[1].loadQRCode('existing-qr-123');
      });

      expect(loadSuccess).toBe(true);
      expect(result.current[0].selectedType).toBe('url');
      expect(result.current[0].content).toEqual({ type: 'url', url: 'https://original.com' });
      expect(result.current[0].qrName).toBe('Existing QR');
    });

    it('should update existing QR code', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle
        .mockResolvedValueOnce({ data: { subscription_tier: 'pro' }, error: null })
        .mockResolvedValueOnce({
          data: {
            id: 'existing-qr-123',
            name: 'Existing QR',
            content_type: 'url',
            content: { type: 'url', url: 'https://original.com' },
            short_code: 'orig123',
          },
          error: null,
        });

      const { result } = renderHook(() =>
        useQRStudioState({ mode: 'edit', qrCodeId: 'existing-qr-123' })
      );

      await waitFor(() => {
        expect(result.current[0].userTierLoading).toBe(false);
      });

      await act(async () => {
        await result.current[1].loadQRCode('existing-qr-123');
      });

      // Modify content
      act(() => {
        result.current[1].setContent({ type: 'url', url: 'https://updated.com' });
      });

      // Save changes
      await act(async () => {
        await result.current[1].saveQRCode();
      });

      // Should use update, not insert
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          content: { type: 'url', url: 'https://updated.com' },
        })
      );
    });
  });
});
