/**
 * Deterministic variant selection algorithm
 * Same visitor (test_id + ip_hash) always gets the same variant
 */

import crypto from 'crypto';
import type { ABVariant, ABAssignment } from './types';

/**
 * Select a variant for a visitor, ensuring deterministic assignment.
 * If the visitor already has an assignment, returns that variant.
 * Otherwise, uses a hash-based bucket system to assign a variant based on weights.
 *
 * @param testId - The A/B test ID
 * @param ipHash - The hashed IP address of the visitor
 * @param variants - Array of variants with their weights
 * @param existingAssignment - Optional existing assignment for this visitor
 * @returns The selected variant
 */
export function selectVariant(
  testId: string,
  ipHash: string,
  variants: ABVariant[],
  existingAssignment: ABAssignment | null
): ABVariant {
  // If no variants, throw error
  if (!variants || variants.length === 0) {
    throw new Error('No variants provided for selection');
  }

  // Return existing assignment if found and variant still exists
  if (existingAssignment) {
    const assignedVariant = variants.find(v => v.id === existingAssignment.variant_id);
    if (assignedVariant) {
      return assignedVariant;
    }
    // If assigned variant no longer exists (deleted), fall through to reassign
  }

  // Single variant - always return it
  if (variants.length === 1) {
    return variants[0];
  }

  // Sort variants by slug for consistent ordering
  const sortedVariants = [...variants].sort((a, b) => a.slug.localeCompare(b.slug));

  // Create deterministic bucket from hash of test_id + ip_hash
  // This ensures the same visitor always lands in the same bucket
  const hashInput = `${testId}:${ipHash}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

  // Convert first 8 hex chars to a number between 0-999
  // Using 8 chars gives us ~4 billion possible values, more than enough
  const bucket = parseInt(hash.slice(0, 8), 16) % 1000;

  // Calculate total weight
  const totalWeight = sortedVariants.reduce((sum, v) => sum + v.weight, 0);

  // Map bucket to variant via cumulative weights
  let cumulative = 0;
  for (const variant of sortedVariants) {
    cumulative += (variant.weight / totalWeight) * 1000;
    if (bucket < cumulative) {
      return variant;
    }
  }

  // Fallback to last variant (shouldn't happen, but safe)
  return sortedVariants[sortedVariants.length - 1];
}

/**
 * Calculate the expected distribution percentages for variants
 * Useful for displaying the configured split in the UI
 *
 * @param variants - Array of variants with their weights
 * @returns Map of variant ID to percentage (0-100)
 */
export function calculateDistribution(variants: ABVariant[]): Map<string, number> {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const distribution = new Map<string, number>();

  for (const variant of variants) {
    const percentage = (variant.weight / totalWeight) * 100;
    distribution.set(variant.id, Math.round(percentage * 10) / 10); // Round to 1 decimal
  }

  return distribution;
}

/**
 * Validate variant weights to ensure they're valid
 *
 * @param variants - Array of variants to validate
 * @returns true if valid, throws error if not
 */
export function validateVariantWeights(variants: { weight: number }[]): boolean {
  if (!variants || variants.length === 0) {
    throw new Error('At least one variant is required');
  }

  for (const variant of variants) {
    if (typeof variant.weight !== 'number' || variant.weight < 1 || variant.weight > 100) {
      throw new Error('Variant weights must be between 1 and 100');
    }
  }

  return true;
}
