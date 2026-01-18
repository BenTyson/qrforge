#!/usr/bin/env tsx
/**
 * Startup Safety Check
 *
 * Run this before starting the development server to ensure
 * the environment is configured safely.
 *
 * Usage: npx tsx src/lib/env/startup-check.ts
 * Or via npm script: npm run safety-check
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env files
// For development safety check, prioritize development-specific files
// Load base files first, then override with development-specific
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });
// Development-specific file takes highest priority (override)
config({ path: resolve(process.cwd(), '.env.development.local'), override: true });

// Now import validation after env vars are loaded
import {
  validateEnvironment,
  getEnvironmentStatus,
  EnvironmentValidationError,
  type EnvironmentConfig,
} from './validate';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function printHeader(): void {
  console.log('\n' + colors.cyan + '=' .repeat(60) + colors.reset);
  console.log(colors.bold + colors.cyan + '  QRWolf Environment Safety Check' + colors.reset);
  console.log(colors.cyan + '=' .repeat(60) + colors.reset + '\n');
}

function printSuccess(config: EnvironmentConfig): void {
  console.log(colors.green + colors.bold + '  SAFE' + colors.reset);
  console.log(colors.green + '  ' + getEnvironmentStatus() + colors.reset);
  console.log();
  console.log('  Environment: ' + colors.cyan + config.environment + colors.reset);
  console.log('  Database:    ' + colors.cyan + (config.supabaseUrl || 'Not configured') + colors.reset);
  console.log('  Production:  ' + (config.isProductionDatabase ? colors.yellow + 'Yes' : colors.green + 'No') + colors.reset);
  console.log();
  console.log(colors.green + '  Ready to start development server!' + colors.reset);
  console.log(colors.cyan + '=' .repeat(60) + colors.reset + '\n');
}

function printError(error: EnvironmentValidationError): void {
  console.log(colors.red + colors.bold + '  BLOCKED' + colors.reset);
  console.log();
  console.log(colors.red + '  ' + error.message.split('\n').join('\n  ') + colors.reset);
  console.log();
  console.log(colors.cyan + '=' .repeat(60) + colors.reset + '\n');
}

function printWarning(message: string): void {
  console.log(colors.yellow + colors.bold + '  WARNING: ' + colors.reset + message);
}

async function main(): Promise<void> {
  printHeader();

  // Check for missing critical environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.log(colors.yellow + '  Warning: Missing environment variables:' + colors.reset);
    missingVars.forEach(v => console.log('    - ' + v));
    console.log();
  }

  // Check for ENVIRONMENT variable
  if (!process.env.ENVIRONMENT) {
    printWarning('ENVIRONMENT variable not set. Defaulting to "development".');
    printWarning('Set ENVIRONMENT=development in your .env.local file.');
    console.log();
  }

  // Check for Stripe test mode in development
  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  if (stripeKey && !stripeKey.startsWith('sk_test_')) {
    if (process.env.ENVIRONMENT !== 'production') {
      printWarning('Using LIVE Stripe key in non-production environment!');
      printWarning('Consider using sk_test_... keys for development.');
      console.log();
    }
  }

  try {
    const config = validateEnvironment();
    printSuccess(config);
    process.exit(0);
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      printError(error);
      process.exit(1);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(colors.red + 'Unexpected error during safety check:' + colors.reset);
  console.error(error);
  process.exit(1);
});
