import crypto from "crypto";

// Mocking the encryption logic for measurement
function encryptPayload(payload: any, keyHex: string): string {
  const ALGORITHM = "aes-256-gcm";
  const KEY = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(json, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64url");
}

const TEST_KEY = "a".repeat(64);

const REAL_URLS = [
  "https://provider1.com/live/ch1/index.m3u8",
  "https://provider1.com/live/ch1/index.m3u8?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWJjIn0.xxx&expires=1234567890&sig=abcdef123456"
];

console.log("📏 Token Size Measurement (v2.1 Architecture)");
console.log("=============================================");

for (const url of REAL_URLS) {
  const payload = {
    sourceUrl: url,
    userId: "550e8400-e29b-41d4-a716-446655440000",
    channelId: "channel-1",
    ip: "192.168.1.100",
    exp: Date.now() + 360_000,
    type: "live"
  };

  const token = encryptPayload(payload, TEST_KEY);

  const segmentUrl =
    `/proxy-seg?url=${encodeURIComponent("https://provider1.com/seg001.ts")}` +
    `&mt=${encodeURIComponent(token)}` +
    `&exp=${Date.now() + 360_000}` +
    `&sig=${"x".repeat(44)}`; // HMAC-SHA256 signature is ~44 chars base64url

  console.log(`\nSource URL length   : ${url.length}`);
  console.log(`Token length (AES)  : ${token.length}`);
  console.log(`Final Segment URL   : ${segmentUrl.length}`);
  
  if (segmentUrl.length < 1800) {
    console.log(`Status              : ✅ SAFE (< 1800 chars)`);
  } else if (segmentUrl.length < 2048) {
    console.log(`Status              : ⚠️ CAUTION (close to 2KB)`);
  } else {
    console.log(`Status              : ❌ DANGER (> 2048 chars)`);
  }
}
