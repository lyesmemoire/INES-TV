import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Hex keys from env
const MAIN_KEY_HEX = process.env.STREAM_ENCRYPT_KEY;
const OLD_KEY_HEX = process.env.STREAM_ENCRYPT_KEY_OLD;

// Prepare key buffer list
const KEYS = [
  MAIN_KEY_HEX,
  OLD_KEY_HEX
]
  .filter((k): k is string => !!k && k.length === 64) // 32 bytes hex = 64 chars
  .map(hex => Buffer.from(hex, "hex"));

export interface StreamPayload {
  sourceUrl: string | string[];
  userId: string;
  channelId: string;
  ip: string;
  exp: number;
  type: "live" | "vod";
}

/**
 * Encrypt payload using the main key.
 */
export function encryptPayload(payload: StreamPayload): string {
  if (KEYS.length === 0) {
    throw new Error("STREAM_ENCRYPT_KEY is not configured or invalid.");
  }

  const key = KEYS[0];
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(json, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // Format: iv(12) + tag(16) + encrypted -> base64url
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64url");
}

/**
 * Decrypt payload, trying all configured keys (for rotation).
 */
export function decryptPayload(token: string): StreamPayload | null {
  for (const key of KEYS) {
    try {
      const combined = Buffer.from(token, "base64url");
      if (combined.length < 28) continue; // 12 + 16 min

      const iv = combined.subarray(0, 12);
      const tag = combined.subarray(12, 28);
      const encrypted = combined.subarray(28);

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      return JSON.parse(decrypted.toString("utf8"));
    } catch {
      continue; // Try next key
    }
  }
  return null;
}
