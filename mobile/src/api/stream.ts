/**
 * 📡 MOBILE STREAM API CLIENT (Phase 60)
 * Handles signed URL fetching, CDN failover, and analytics reporting.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function authFetch(path: string, options: RequestInit = {}) {
  const { getAuthToken } = await import('../store/useAuthStore')
  const token = getAuthToken()

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH SIGNED STREAM URL (with CDN failover)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchStreamUrl(channelId: string, fallback = false) {
  const res = await authFetch(`/api/streams/${channelId}?fallback=${fallback}`)

  if (!res.ok) throw new Error(`Stream fetch failed: ${res.status}`)

  const data = await res.json()
  return {
    url:         data.url         as string,
    token:       data.token       as string,
    expires:     data.expires     as number,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS: Play Start
// Fire-and-forget — never throws
// ─────────────────────────────────────────────────────────────────────────────

export async function reportPlay(channelId: string): Promise<void> {
  try {
    await authFetch(`/api/streams/start`, {
      method: 'POST',
      body: JSON.stringify({ channelId }),
    })
  } catch {
    // Silently ignore — never block playback for analytics
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS: Play Stop
// Reports session end for watch-time calculation
// ─────────────────────────────────────────────────────────────────────────────

export async function reportStop(channelId: string): Promise<void> {
  try {
    await authFetch(`/api/streams/stop`, {
      method: 'POST',
      body: JSON.stringify({ channelId }),
    })
  } catch {
    // Silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS: Ad Skip
// Feeds the ad fatigue detection engine + optional per-ad tracking
// ─────────────────────────────────────────────────────────────────────────────

export async function reportAdSkip(adId?: string): Promise<void> {
  try {
    await authFetch(`/api/ads/skip`, {
      method: 'POST',
      body: adId ? JSON.stringify({ adId }) : undefined,
    })
  } catch {
    // Silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS: Ad Click
// Tracks CTA click for per-ad CTR computation
// ─────────────────────────────────────────────────────────────────────────────

export async function reportAdClick(adId: string): Promise<void> {
  try {
    await authFetch(`/api/ads/impression`, {
      method: 'POST',
      body: JSON.stringify({ adId, type: 'click' }),
    })
  } catch {
    // Silently ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC AD INSERTION (Single provider, rotation per IP)
// ─────────────────────────────────────────────────────────────────────────────

export interface DynamicAdResponse {
  id:         string;
  provider:   string;
  name:       string;
  baseCpm:    number;
  displayUrl: string;
}

/**
 * Fetches a single dynamically selected ad for the current device.
 * Returns null on no-fill (204) or any error.
 */
export async function fetchDynamicAd(): Promise<DynamicAdResponse | null> {
  try {
    const res = await authFetch('/api/ads/dynamic')
    if (res.status === 204) return null    // No fill or Premium user
    if (!res.ok) return null
    return await res.json() as DynamicAdResponse
  } catch {
    return null   // Never block the player
  }
}

/**
 * Reports a click on a dynamic ad (for CTR tracking).
 */
export async function reportDynamicAdClick(provider: string): Promise<void> {
  try {
    await authFetch('/api/ads/dynamic/click', {
      method: 'POST',
      body:   JSON.stringify({ provider }),
    })
  } catch {
    // Silently ignore
  }
}

