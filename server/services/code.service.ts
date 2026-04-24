import { redis } from "./redis.service";

function generateRandomCode(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export async function createCode(days: number) {
  const code = generateRandomCode();

  await redis.set(
    `code:${code}`,
    JSON.stringify({
      days,
      used: false,
    })
  );

  return code;
}

export async function redeemCode(code: string, userId: string) {
  const data = await redis.get(`code:${code}`);

  if (!data) return { error: "INVALID" };

  const parsed = JSON.parse(data);

  if (parsed.used) return { error: "ALREADY_USED" };

  const expiresAt = Date.now() + parsed.days * 86400000;

  await redis.set(`premium:${userId}`, expiresAt);

  await redis.set(
    `code:${code}`,
    JSON.stringify({
      ...parsed,
      used: true,
      usedBy: userId,
    })
  );

  return { success: true, expiresAt };
}
