import cache from "../lib/cache";

const LIMITS: Record<string, number> = {
  FREE: 1,
  BASIC: 2,
};

const SESSION_TTL = 60; // 60 seconds — hard expiry against ghost sessions

/**
 * Check if user is allowed to open another stream.
 * Works with Redis OR in-memory (no Redis required).
 */
export async function canStream(userId: string, plan: string = "FREE"): Promise<boolean> {
  const limit = LIMITS[plan?.toUpperCase()] ?? 1;
  const count = await cache.scard(`sessions:${userId}`);
  return count < limit;
}

/**
 * Register an active session.
 */
export async function openSession(userId: string, channelId: string): Promise<void> {
  await cache.sadd(`sessions:${userId}`, channelId, SESSION_TTL);
}

/**
 * Release a session (call on stop or disconnect).
 */
export async function closeSession(userId: string, channelId: string): Promise<void> {
  await cache.srem(`sessions:${userId}`, channelId);
}
