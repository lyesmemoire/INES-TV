import crypto from "crypto"

const SECRET = process.env.STREAM_SECRET || "dev_secret"

export function generateStreamToken(userId: string, channelId: string, ip: string, userAgent: string) {
  const payload = `${userId}:${channelId}:${ip}:${userAgent}:${Date.now()}`
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")

  return Buffer.from(`${payload}:${signature}`).toString("base64")
}

export function verifyStreamToken(token: string, currentIp: string, currentUserAgent: string) {
  try {
    const decoded = Buffer.from(token, "base64").toString()
    const [userId, channelId, ip, userAgent, ts, signature] = decoded.split(":")

    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${userId}:${channelId}:${ip}:${userAgent}:${ts}`)
      .digest("hex")

    if (expected !== signature) return null

    // expire après 30 sec
    if (Date.now() - Number(ts) > 30000) return null
    
    // IP and UserAgent check
    if (ip !== currentIp || userAgent !== currentUserAgent) return null

    return { userId, channelId }
  } catch {
    return null
  }
}
