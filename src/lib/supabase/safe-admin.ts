/**
 * Safe Admin Client for Supabase
 *
 * Provides wrapper methods for destructive database operations
 * with environment-aware safety checks.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getEnvironmentConfig,
  canPerformDestructiveOperations,
  EnvironmentValidationError,
} from '../env/validate';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Operation types that are considered destructive
 */
export type DestructiveOperation = 'DELETE' | 'TRUNCATE' | 'DROP' | 'UPDATE_ALL';

/**
 * Log entry for auditing operations
 */
export interface OperationLog {
  timestamp: Date;
  operation: string;
  table: string;
  environment: string;
  isProduction: boolean;
  blocked: boolean;
  reason?: string;
}

// In-memory log for debugging (in production, this would go to a proper logging service)
const operationLogs: OperationLog[] = [];

/**
 * Log an operation for auditing
 */
function logOperation(entry: OperationLog): void {
  operationLogs.push(entry);

  // Also log to console in development
  const config = getEnvironmentConfig();
  if (config.isDevelopment) {
    const status = entry.blocked ? '[ BLOCKED ]' : '[ OK ]';
    console.log(
      `[SafeAdmin] ${status} ${entry.operation} on ${entry.table} (${entry.environment})` +
      (entry.reason ? ` - ${entry.reason}` : '')
    );
  }
}

/**
 * Get recent operation logs
 */
export function getOperationLogs(limit = 100): OperationLog[] {
  return operationLogs.slice(-limit);
}

/**
 * Clear operation logs (for testing)
 */
export function clearOperationLogs(): void {
  operationLogs.length = 0;
}

/**
 * Safe Admin Client
 *
 * Wraps Supabase admin client with safety checks for destructive operations.
 */
export class SafeAdminClient {
  private client: SupabaseClient;
  private config = getEnvironmentConfig();

  constructor() {
    this.client = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Get the underlying Supabase client for read operations
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Check if a destructive operation should be allowed
   */
  private checkDestructiveOperation(
    operation: DestructiveOperation,
    table: string
  ): void {
    const log: OperationLog = {
      timestamp: new Date(),
      operation,
      table,
      environment: this.config.environment,
      isProduction: this.config.isProduction,
      blocked: false,
    };

    // Block destructive operations in production
    if (this.config.isProduction && !canPerformDestructiveOperations()) {
      log.blocked = true;
      log.reason = 'Destructive operations blocked in production';
      logOperation(log);

      throw new EnvironmentValidationError(
        `BLOCKED: ${operation} operation on table "${table}" is not allowed in production.\n` +
        `This is a safety measure to protect customer data.\n\n` +
        `If this operation is intentional, use the Supabase dashboard or\n` +
        `create a migration script with proper review.`
      );
    }

    // Allow but warn in development with production database
    if (this.config.isDevelopment && this.config.isProductionDatabase) {
      log.blocked = true;
      log.reason = 'Development environment connected to production database';
      logOperation(log);

      throw new EnvironmentValidationError(
        `BLOCKED: ${operation} operation blocked - development environment is ` +
        `connected to production database.\n\n` +
        `Configure a development Supabase project to perform destructive operations.`
      );
    }

    logOperation(log);
  }

  /**
   * Safe DELETE operation
   * Requires explicit conditions to prevent accidental mass deletion
   */
  async safeDelete(
    table: string,
    conditions: Record<string, unknown>
  ): Promise<{ error: Error | null }> {
    if (Object.keys(conditions).length === 0) {
      throw new EnvironmentValidationError(
        `DELETE without conditions is not allowed. ` +
        `Use safeTruncate() if you want to delete all rows.`
      );
    }

    this.checkDestructiveOperation('DELETE', table);

    let query = this.client.from(table).delete();
    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value);
    }

    const { error } = await query;
    return { error };
  }

  /**
   * Safe TRUNCATE operation
   * Only allowed in development/test environments with non-production database
   */
  async safeTruncate(table: string): Promise<{ error: Error | null }> {
    this.checkDestructiveOperation('TRUNCATE', table);

    // Supabase doesn't support TRUNCATE directly, use DELETE without conditions
    // This is intentionally slower to discourage use
    const { error } = await this.client
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    return { error };
  }

  /**
   * Safe bulk UPDATE operation
   * Requires explicit conditions to prevent accidental mass updates
   */
  async safeUpdate(
    table: string,
    data: Record<string, unknown>,
    conditions: Record<string, unknown>
  ): Promise<{ error: Error | null }> {
    if (Object.keys(conditions).length === 0) {
      this.checkDestructiveOperation('UPDATE_ALL', table);
    }

    let query = this.client.from(table).update(data);
    for (const [key, value] of Object.entries(conditions)) {
      query = query.eq(key, value);
    }

    const { error } = await query;
    return { error };
  }

  /**
   * Execute a raw SQL query (extremely dangerous - heavily restricted)
   * Only allowed in test environment with local database
   */
  async executeRawSQL(sql: string): Promise<{ data: unknown; error: Error | null }> {
    // Only allow in test environment with local Supabase
    if (!this.config.isTest) {
      throw new EnvironmentValidationError(
        `Raw SQL execution is only allowed in test environment.`
      );
    }

    if (this.config.isProductionDatabase) {
      throw new EnvironmentValidationError(
        `Raw SQL execution is blocked - connected to production database.`
      );
    }

    // Log the operation
    logOperation({
      timestamp: new Date(),
      operation: 'RAW_SQL',
      table: 'N/A',
      environment: this.config.environment,
      isProduction: false,
      blocked: false,
      reason: `SQL: ${sql.substring(0, 100)}...`,
    });

    const { data, error } = await this.client.rpc('exec_sql', { sql });
    return { data, error };
  }
}

/**
 * Create a safe admin client instance
 */
export function createSafeAdminClient(): SafeAdminClient {
  return new SafeAdminClient();
}

/**
 * Get a singleton safe admin client
 */
let _safeAdminClient: SafeAdminClient | null = null;

export function getSafeAdminClient(): SafeAdminClient {
  if (!_safeAdminClient) {
    _safeAdminClient = new SafeAdminClient();
  }
  return _safeAdminClient;
}
