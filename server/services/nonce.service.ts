import crypto from "node:crypto";
import cache from "../lib/cache";

const TTL = 30; // seconds

/**
 * Create a one-time nonce bound to a userId.
 * Works with Redis OR in-memory (no Redis required).
 */
export async function createNonce(userId: string): Promise<string> {
  const nonce = crypto.randomUUID();
  await cache.set(`nonce:${nonce}`, userId, TTL);
  return nonce;
}

/**
 * Validate and consume a nonce (single-use).
 * Returns false if nonce is missing, wrong user, or already used.
 */
export async function validateNonce(
  nonce: string,
  userId: string
): Promise<boolean> {
  if (!nonce || !userId) return false;
  const stored = await cache.get(`nonce:${nonce}`);
  if (stored !== userId) return false;
  await cache.del(`nonce:${nonce}`); // Consume immediately — single-use
  return true;
}

export const issueNonce = createNonce;
