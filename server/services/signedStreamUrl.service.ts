import crypto from "crypto";

const SECRET = process.env.STREAM_SECRET!;

const ALGO = "aes-256-gcm";
const SECRET_KEY = Buffer.from(process.env.STREAM_ENCRYPT_KEY!, "hex");

export function generateUltraToken(payload: any): string {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // ⚡ REQUIRED FORMAT: base64url(iv | tag | encrypted)
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

/**
 * Vérifie et décrypte un token généré par generateUltraToken.
 */
export function verifyStreamToken(token: string) {
  try {
    const combined = Buffer.from(token, "base64url");
    
    // 🛡️ v4 Hardening: Enforce minimum buffer length (IV:12 + Tag:16 = 28)
    if (combined.length < 28) {
      throw new Error("Invalid token structure (length)");
    }

    const iv        = combined.subarray(0, 12);
    const tag       = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);

    const decipher = crypto.createDecipheriv(
      ALGO,
      SECRET_KEY,
      iv
    );
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    const data = JSON.parse(decrypted);

    if (data.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expiré
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * URL signée legacy (non utilisée par le flow principal).
 */
export function signUrl(payload: any) {
  const exp = Date.now() + 60 * 1000;
  const data = JSON.stringify({ ...payload, exp });

  const iv     = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ALGO,
    SECRET_KEY,
    iv
  );

  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag       = cipher.getAuthTag();
  const combined  = Buffer.concat([iv, tag, encrypted]);

  return `${process.env.WORKER_URL}/stream?token=${combined.toString("base64url")}`;
}

