import { redis } from "./redis.service";

export async function trackSession(sessionId: string) {
  const key = `profile:${sessionId}`;

  const data = JSON.parse(await redis.get(key) || "{}");

  const updated = {
    ...data,
    sessions: (data.sessions || 0) + 1,
    lastSeen: Date.now(),
  };

  await redis.set(key, JSON.stringify(updated), "EX", 86400);
}
