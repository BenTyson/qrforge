/**
 * A/B Testing module for dynamic QR codes
 * Pro+ feature for splitting traffic between destinations
 */

export * from './types';
export { selectVariant, calculateDistribution, validateVariantWeights } from './variant-selector';
export {
  calculateSignificance,
  calculateTestStatistics,
  determineWinner,
  formatConfidence,
  formatImprovement,
} from './statistics';
