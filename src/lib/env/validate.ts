/**
 * Environment Validation
 *
 * Protects against accidentally connecting to production database
 * from development environment. Critical for data safety.
 */

export type Environment = 'development' | 'test' | 'production';

// Known production Supabase URL patterns
// Add your production project refs here
const PRODUCTION_SUPABASE_REFS = [
  'otdlggbhsmgqhsviazho', // QRWolf production
];

export interface EnvironmentConfig {
  environment: Environment;
  supabaseUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  isProductionDatabase: boolean;
}

/**
 * Detect if a Supabase URL points to a production database
 */
export function isProductionSupabaseUrl(url: string): boolean {
  if (!url) return false;

  // Check against known production project refs
  for (const ref of PRODUCTION_SUPABASE_REFS) {
    if (url.includes(ref)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect the current environment from ENVIRONMENT variable
 */
export function getEnvironment(): Environment {
  const env = process.env.ENVIRONMENT?.toLowerCase();

  if (env === 'test') return 'test';
  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'development' || env === 'dev') return 'development';

  // Default based on other signals
  if (process.env.NODE_ENV === 'test') return 'test';
  if (process.env.NODE_ENV === 'production') return 'production';

  return 'development';
}

/**
 * Get full environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = getEnvironment();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  return {
    environment,
    supabaseUrl,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
    isTest: environment === 'test',
    isProductionDatabase: isProductionSupabaseUrl(supabaseUrl),
  };
}

/**
 * Validation error thrown when environment configuration is dangerous
 */
export class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validate that the environment configuration is safe
 * Throws if development/test environment is connected to production database
 */
export function validateEnvironment(): EnvironmentConfig {
  const config = getEnvironmentConfig();

  // CRITICAL: Block development environment connecting to production database
  if (config.isDevelopment && config.isProductionDatabase) {
    throw new EnvironmentValidationError(
      `DANGER: Development environment is connected to PRODUCTION database!\n` +
      `Supabase URL: ${config.supabaseUrl}\n\n` +
      `This configuration could corrupt customer data.\n\n` +
      `To fix:\n` +
      `1. Create a development Supabase project at supabase.com\n` +
      `2. Update .env.development.local with dev project credentials\n` +
      `3. Or set ENVIRONMENT=production if this is intentional`
    );
  }

  // CRITICAL: Block test environment connecting to production database
  if (config.isTest && config.isProductionDatabase) {
    throw new EnvironmentValidationError(
      `DANGER: Test environment is connected to PRODUCTION database!\n` +
      `Supabase URL: ${config.supabaseUrl}\n\n` +
      `Running tests against production would corrupt customer data.\n\n` +
      `To fix:\n` +
      `1. Use Supabase local development: supabase start\n` +
      `2. Or update .env.test.local with test database credentials`
    );
  }

  return config;
}

/**
 * Safe wrapper that validates environment before proceeding
 * Use this at the start of operations that could affect data
 */
export function ensureSafeEnvironment(): EnvironmentConfig {
  return validateEnvironment();
}

/**
 * Check if destructive operations (DELETE, TRUNCATE) should be allowed
 */
export function canPerformDestructiveOperations(): boolean {
  const config = getEnvironmentConfig();

  // Only allow destructive operations in development or test
  return config.isDevelopment || config.isTest;
}

/**
 * Get a human-readable environment status string
 */
export function getEnvironmentStatus(): string {
  const config = getEnvironmentConfig();

  if (config.isProduction) {
    return `Production mode - Connected to LIVE database`;
  }

  if (config.isTest) {
    return `Test mode - ${config.isProductionDatabase ? 'WARNING: Production DB!' : 'Safe test database'}`;
  }

  return `Development mode - ${config.isProductionDatabase ? 'WARNING: Production DB!' : 'Safe to experiment'}`;
}
