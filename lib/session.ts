import redis from "./redis"

export async function lockSession(userId: string, deviceId: string) {
  const key = `session:${userId}`
  const current = await redis.get(key)

  if (current && current !== deviceId) {
    await redis.del(key) // kick old device
  }

  await redis.set(key, deviceId, { EX: 60 * 60 * 24 })
}

export async function validateSession(userId: string, deviceId: string) {
  const current = await redis.get(`session:${userId}`)
  return current === deviceId
}
