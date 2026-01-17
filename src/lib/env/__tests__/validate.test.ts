/**
 * Environment Validation Tests
 *
 * Tests for environment safety mechanisms.
 */

import {
  isProductionSupabaseUrl,
  getEnvironment,
  getEnvironmentConfig,
  validateEnvironment,
  canPerformDestructiveOperations,
  getEnvironmentStatus,
  EnvironmentValidationError,
} from '../validate';

describe('Environment Validation', () => {
  // Store original env vars
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset to test environment
    process.env.ENVIRONMENT = 'test';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('isProductionSupabaseUrl', () => {
    it('should detect production Supabase URL', () => {
      expect(isProductionSupabaseUrl('https://otdlggbhsmgqhsviazho.supabase.co')).toBe(true);
    });

    it('should return false for development URL', () => {
      expect(isProductionSupabaseUrl('http://127.0.0.1:54321')).toBe(false);
      expect(isProductionSupabaseUrl('https://dev-project.supabase.co')).toBe(false);
    });

    it('should handle empty/null URLs', () => {
      expect(isProductionSupabaseUrl('')).toBe(false);
    });
  });

  describe('getEnvironment', () => {
    it('should return development for dev environment', () => {
      process.env.ENVIRONMENT = 'development';
      expect(getEnvironment()).toBe('development');
    });

    it('should return test for test environment', () => {
      process.env.ENVIRONMENT = 'test';
      expect(getEnvironment()).toBe('test');
    });

    it('should return production for prod environment', () => {
      process.env.ENVIRONMENT = 'production';
      expect(getEnvironment()).toBe('production');
    });

    it('should handle abbreviated environment names', () => {
      process.env.ENVIRONMENT = 'dev';
      expect(getEnvironment()).toBe('development');

      process.env.ENVIRONMENT = 'prod';
      expect(getEnvironment()).toBe('production');
    });

    it('should be case-insensitive', () => {
      process.env.ENVIRONMENT = 'DEVELOPMENT';
      expect(getEnvironment()).toBe('development');

      process.env.ENVIRONMENT = 'TEST';
      expect(getEnvironment()).toBe('test');
    });

    it('should default to development if not set', () => {
      delete process.env.ENVIRONMENT;
      // NODE_ENV is 'test' in Jest, so without ENVIRONMENT, it falls back to test
      // When NODE_ENV is unset, it defaults to development
      (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
      expect(getEnvironment()).toBe('development');
    });

    it('should respect NODE_ENV as fallback', () => {
      delete process.env.ENVIRONMENT;
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      expect(getEnvironment()).toBe('production');
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return correct config for test environment', () => {
      process.env.ENVIRONMENT = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';

      const config = getEnvironmentConfig();

      expect(config.environment).toBe('test');
      expect(config.isTest).toBe(true);
      expect(config.isDevelopment).toBe(false);
      expect(config.isProduction).toBe(false);
      expect(config.isProductionDatabase).toBe(false);
    });

    it('should return correct config for development environment', () => {
      process.env.ENVIRONMENT = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dev-project.supabase.co';

      const config = getEnvironmentConfig();

      expect(config.environment).toBe('development');
      expect(config.isDevelopment).toBe(true);
      expect(config.isTest).toBe(false);
      expect(config.isProduction).toBe(false);
    });

    it('should detect production database in dev environment', () => {
      process.env.ENVIRONMENT = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://otdlggbhsmgqhsviazho.supabase.co';

      const config = getEnvironmentConfig();

      expect(config.isDevelopment).toBe(true);
      expect(config.isProductionDatabase).toBe(true);
    });
  });

  describe('validateEnvironment', () => {
    it('should pass for test environment with local database', () => {
      process.env.ENVIRONMENT = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';

      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should pass for development environment with dev database', () => {
      process.env.ENVIRONMENT = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dev-project.supabase.co';

      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should pass for production environment with production database', () => {
      process.env.ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://otdlggbhsmgqhsviazho.supabase.co';

      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw for development environment with production database', () => {
      process.env.ENVIRONMENT = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://otdlggbhsmgqhsviazho.supabase.co';

      expect(() => validateEnvironment()).toThrow(EnvironmentValidationError);
      expect(() => validateEnvironment()).toThrow(/DANGER/);
      expect(() => validateEnvironment()).toThrow(/development.*production/i);
    });

    it('should throw for test environment with production database', () => {
      process.env.ENVIRONMENT = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://otdlggbhsmgqhsviazho.supabase.co';

      expect(() => validateEnvironment()).toThrow(EnvironmentValidationError);
      expect(() => validateEnvironment()).toThrow(/test.*production/i);
    });

    it('should return config on success', () => {
      process.env.ENVIRONMENT = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';

      const config = validateEnvironment();
      expect(config.environment).toBe('test');
    });
  });

  describe('canPerformDestructiveOperations', () => {
    it('should return true for development environment', () => {
      process.env.ENVIRONMENT = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dev-project.supabase.co';

      expect(canPerformDestructiveOperations()).toBe(true);
    });

    it('should return true for test environment', () => {
      process.env.ENVIRONMENT = 'test';
      expect(canPerformDestructiveOperations()).toBe(true);
    });

    it('should return false for production environment', () => {
      process.env.ENVIRONMENT = 'production';
      expect(canPerformDestructiveOperations()).toBe(false);
    });
  });

  describe('getEnvironmentStatus', () => {
    it('should return production status message', () => {
      process.env.ENVIRONMENT = 'production';
      const status = getEnvironmentStatus();
      expect(status).toContain('Production');
      expect(status).toContain('LIVE');
    });

    it('should return test status message', () => {
      process.env.ENVIRONMENT = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
      const status = getEnvironmentStatus();
      expect(status).toContain('Test');
      expect(status).toContain('Safe');
    });

    it('should return development status with safe message', () => {
      process.env.ENVIRONMENT = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dev-project.supabase.co';
      const status = getEnvironmentStatus();
      expect(status).toContain('Development');
      expect(status).toContain('Safe');
    });

    it('should warn about production database in dev', () => {
      process.env.ENVIRONMENT = 'development';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://otdlggbhsmgqhsviazho.supabase.co';
      const status = getEnvironmentStatus();
      expect(status).toContain('WARNING');
      expect(status).toContain('Production');
    });
  });

  describe('EnvironmentValidationError', () => {
    it('should be an instance of Error', () => {
      const error = new EnvironmentValidationError('test message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = new EnvironmentValidationError('test message');
      expect(error.name).toBe('EnvironmentValidationError');
    });

    it('should have correct message', () => {
      const error = new EnvironmentValidationError('test message');
      expect(error.message).toBe('test message');
    });
  });
});
