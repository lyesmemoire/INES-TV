/**
 * 🎯 STREAM LOAD BALANCER (Rule-Based)
 *
 * Picks the best source for a channel based on:
 *  - healthScore   (60% weight)  — overall quality from health checks
 *  - priority      (30% weight)  — admin-set priority
 *  - isActive      (filter)      — only active sources
 *
 * Aligned with Supabase "LiveSource" table schema.
 * No AI — deterministic, debuggable, production-grade.
 */

export type SourceRecord = {
  id: string
  url: string
  priority: number
  healthScore: number
  isActive: boolean
  channelId: string
  type?: string
  lastCheckedAt?: string | null
}

/** Compute a composite score for a single source. */
export function computeScore(s: SourceRecord, userCountry?: string): number {
  if (!s.isActive) return 0

  const health = s.healthScore ?? 0.5
  const prio   = Math.min(s.priority ?? 5, 10) / 10

  let score = health * 0.7 + prio * 0.3

  // Geo-Load Balancing: Boost score if source URL implies proximity (e.g. .fr for FR users)
  if (userCountry && s.url) {
    const tldMatch = s.url.match(/\.([a-z]{2})(?:\/|$)/i)
    if (tldMatch && tldMatch[1].toLowerCase() === userCountry.toLowerCase()) {
      score += 0.15 // Boost for local server
    }
  }

  return score
}

/**
 * Sort sources by composite score (best first).
 * Inactive sources are filtered out.
 * 
 * SMART ROTATION: Top tier sources (score > 0.8) are slightly randomized 
 * to distribute load among equivalent servers.
 */
export function selectBestSources(sources: SourceRecord[], userCountry?: string): SourceRecord[] {
  const activeSources = sources.filter(s => s.isActive !== false)
  
  // Calculate exact deterministic scores
  const scoredSources = activeSources.map(s => ({
    source: s,
    baseScore: computeScore(s, userCountry)
  }))

  return scoredSources
    .sort((a, b) => {
      // If both are top tier (> 0.8), introduce ±0.05 randomness for Smart Rotation
      let scoreA = a.baseScore
      let scoreB = b.baseScore

      if (scoreA > 0.8 && scoreB > 0.8) {
        scoreA += (Math.random() * 0.1) - 0.05
        scoreB += (Math.random() * 0.1) - 0.05
      }

      return scoreB - scoreA
    })
    .map(s => s.source)
}
