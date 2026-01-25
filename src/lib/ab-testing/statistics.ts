/**
 * Statistical significance calculations for A/B testing
 * Uses a two-proportion z-test to compare variant performance
 */

import type { ABTestStatistics, ABVariant } from './types';

/**
 * Standard normal cumulative distribution function (CDF)
 * Approximation using error function
 */
function normalCDF(x: number): number {
  // Approximation constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  // Error function approximation
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate p-value from z-score (two-tailed test)
 */
function zScoreToPValue(z: number): number {
  return 2 * (1 - normalCDF(Math.abs(z)));
}

/**
 * Calculate statistical significance for an A/B test
 *
 * @param controlScans - Number of scans for the control variant (A)
 * @param variantScans - Number of scans for the test variant (B)
 * @param targetConfidence - Target confidence level (default 0.95 for 95%)
 * @returns Statistics including confidence level and significance
 */
export function calculateSignificance(
  controlScans: number,
  variantScans: number,
  targetConfidence: number = 0.95
): ABTestStatistics {
  const totalScans = controlScans + variantScans;

  // Need minimum samples for meaningful statistics
  const minSamples = 30;

  // Calculate rates (proportion of total)
  const controlRate = totalScans > 0 ? controlScans / totalScans : 0;
  const variantRate = totalScans > 0 ? variantScans / totalScans : 0;

  // Calculate improvement percentage
  const improvement = controlScans > 0
    ? ((variantScans - controlScans) / controlScans) * 100
    : 0;

  // Not enough data yet
  if (totalScans < minSamples) {
    const scansNeeded = Math.max(0, minSamples - totalScans);
    return {
      controlScans,
      variantScans,
      controlRate,
      variantRate,
      improvement,
      zScore: 0,
      pValue: 1,
      confidence: 0,
      isSignificant: false,
      scansNeeded,
    };
  }

  // Two-proportion z-test
  // H0: p1 = p2 (no difference between variants)
  // H1: p1 != p2 (there is a difference)

  // Pooled proportion
  const p1 = controlRate;
  const p2 = variantRate;
  const pPooled = (controlScans + variantScans) / (2 * totalScans);

  // Standard error
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / totalScans + 1 / totalScans));

  // Z-score
  const zScore = se > 0 ? (p2 - p1) / se : 0;

  // P-value (two-tailed)
  const pValue = zScoreToPValue(zScore);

  // Confidence level (1 - pValue)
  const confidence = Math.max(0, Math.min(1, 1 - pValue));

  // Is it statistically significant?
  const isSignificant = confidence >= targetConfidence;

  // Estimate scans needed to reach target confidence
  // Using power analysis approximation
  const scansNeeded = isSignificant
    ? 0
    : estimateScansNeeded(controlScans, variantScans, targetConfidence);

  return {
    controlScans,
    variantScans,
    controlRate,
    variantRate,
    improvement,
    zScore,
    pValue,
    confidence,
    isSignificant,
    scansNeeded,
  };
}

/**
 * Estimate additional scans needed to reach target confidence
 * This is a rough approximation based on current data
 */
function estimateScansNeeded(
  controlScans: number,
  variantScans: number,
  targetConfidence: number
): number {
  const totalScans = controlScans + variantScans;
  const currentConfidence = calculateSignificance(controlScans, variantScans, targetConfidence).confidence;

  // If we're already at target, no more needed
  if (currentConfidence >= targetConfidence) {
    return 0;
  }

  // Very rough estimate: confidence increases roughly with sqrt(n)
  // So to increase confidence by x%, we need (x/current)^2 more samples
  const targetPValue = 1 - targetConfidence;
  const currentPValue = 1 - currentConfidence;

  if (currentPValue <= 0 || currentPValue <= targetPValue) {
    return 0;
  }

  // Estimate based on sample size relationship to confidence
  const ratio = Math.sqrt(currentPValue / targetPValue);
  const estimatedTotalNeeded = Math.ceil(totalScans * ratio * ratio);
  const additionalNeeded = Math.max(0, estimatedTotalNeeded - totalScans);

  // Cap at reasonable maximum to avoid showing unrealistic numbers
  return Math.min(additionalNeeded, 10000);
}

/**
 * Calculate statistics for a test with multiple variants
 * Compares each variant against the control (first variant by slug order)
 *
 * @param variants - Array of variants with scan counts
 * @param targetConfidence - Target confidence level
 * @returns Map of variant ID to statistics (compared against control)
 */
export function calculateTestStatistics(
  variants: ABVariant[],
  targetConfidence: number = 0.95
): Map<string, ABTestStatistics> {
  if (variants.length < 2) {
    return new Map();
  }

  // Sort by slug to ensure control is first (a < b < c...)
  const sortedVariants = [...variants].sort((a, b) => a.slug.localeCompare(b.slug));
  const control = sortedVariants[0];
  const results = new Map<string, ABTestStatistics>();

  // Calculate stats for each variant vs control
  for (let i = 1; i < sortedVariants.length; i++) {
    const variant = sortedVariants[i];
    const stats = calculateSignificance(
      control.scan_count,
      variant.scan_count,
      targetConfidence
    );
    results.set(variant.id, stats);
  }

  return results;
}

/**
 * Determine if a winner can be declared
 * A winner can be declared when one variant is significantly better than others
 *
 * @param variants - Array of variants with scan counts
 * @param targetConfidence - Target confidence level
 * @returns The winning variant ID, or null if no clear winner
 */
export function determineWinner(
  variants: ABVariant[],
  targetConfidence: number = 0.95
): string | null {
  if (variants.length < 2) {
    return null;
  }

  const stats = calculateTestStatistics(variants, targetConfidence);

  // Check if any variant is significantly better than control
  for (const [variantId, variantStats] of stats) {
    if (variantStats.isSignificant && variantStats.improvement > 0) {
      return variantId;
    }
  }

  // Check if control is significantly better than all variants
  const sortedVariants = [...variants].sort((a, b) => a.slug.localeCompare(b.slug));
  const control = sortedVariants[0];

  let controlWins = true;
  for (const [, variantStats] of stats) {
    if (!variantStats.isSignificant || variantStats.improvement > 0) {
      controlWins = false;
      break;
    }
  }

  if (controlWins) {
    return control.id;
  }

  return null;
}

/**
 * Format confidence as a percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Format improvement as a percentage string with sign
 */
export function formatImprovement(improvement: number): string {
  const sign = improvement > 0 ? '+' : '';
  return `${sign}${improvement.toFixed(1)}%`;
}
