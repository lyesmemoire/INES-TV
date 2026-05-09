/**
 * 🎯 AD OPTIMIZER ENGINE
 * Calculates performance scores for ad providers to maximize RPM.
 */

export interface ProviderScoreInput {
  rpm: number;
  ctr: number;
  stability: number;
  priorityBoost: number;
  qualityScore: number;
}

/**
 * Calculates a weighted score for an ad provider.
 * Weights:
 * - RPM (Revenue): 50% - Primary goal
 * - CTR (Engagement): 15% - Proxy for user interest
 * - Stability: 15% - Reliability of the script/tracking
 * - Quality: 10% - Safety and UX (malware/redirects)
 * - Priority Boost: 10% - Manual override
 */
export function calculateScore(input: ProviderScoreInput): number {
  // Stability and Quality act as multipliers or heavy weights
  const performanceScore = (input.rpm * 0.5) + (input.ctr * 15) + (input.priorityBoost * 0.1);
  
  const stabilityFactor = input.stability / 100;
  const qualityFactor = input.qualityScore / 100;

  // Final score is adjusted by reliability and safety
  return performanceScore * stabilityFactor * qualityFactor;
}
