import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export type MetricSnapshot = {
  timestamp: number
  activeUsers: number
  activeStreams: number
  cacheHitRate: number
  avgLatency: number
  errorRate: number
  bandwidthUsage: number
}

export type UserSession = {
  userId: string
  deviceId: string
  channelId: string
  startTime: number
  lastHeartbeat: number
  quality: number
  location?: string
}

export type StreamHealth = {
  channelId: string
  status: "healthy" | "degraded" | "down"
  viewers: number
  avgBuffering: number
  errorCount: number
  uptime: number
}

export type Alert = {
  id: string
  type: "error" | "warning" | "info"
  message: string
  timestamp: number
  resolved: boolean
}

// =====================
// METRICS COLLECTION
// =====================

export async function recordMetric(key: string, value: number) {
  const timestamp = Date.now()
  const metricKey = `metric:${key}:${Math.floor(timestamp / 1000)}`
  
  await redis.set(metricKey, value, { ex: 3600 }) // Keep for 1 hour
  await redis.lpush(`metrics:${key}:history`, JSON.stringify({ timestamp, value }))
  await redis.ltrim(`metrics:${key}:history`, 0, 99) // Keep last 100
}

export async function getMetricHistory(key: string, limit = 50): Promise<{ timestamp: number; value: number }[]> {
  const history = await redis.lrange(`metrics:${key}:history`, 0, limit - 1)
  return history.map((item: string) => JSON.parse(item))
}

export async function getCurrentMetrics(): Promise<MetricSnapshot> {
  const [
    activeUsers,
    activeStreams,
    cacheHitRate,
    avgLatency,
    errorRate,
    bandwidthUsage,
  ] = await Promise.all([
    redis.get("metrics:activeUsers") || 0,
    redis.get("metrics:activeStreams") || 0,
    redis.get("metrics:cacheHitRate") || 0,
    redis.get("metrics:avgLatency") || 0,
    redis.get("metrics:errorRate") || 0,
    redis.get("metrics:bandwidthUsage") || 0,
  ])

  return {
    timestamp: Date.now(),
    activeUsers: Number(activeUsers),
    activeStreams: Number(activeStreams),
    cacheHitRate: Number(cacheHitRate),
    avgLatency: Number(avgLatency),
    errorRate: Number(errorRate),
    bandwidthUsage: Number(bandwidthUsage),
  }
}

// =====================
// USER SESSIONS
// =====================

export async function trackUserSession(session: UserSession) {
  const sessionKey = `session:user:${session.userId}:${session.deviceId}`
  await redis.set(sessionKey, JSON.stringify(session), { ex: 3600 })
  
  // Add to active sessions set
  await redis.sadd("sessions:active", sessionKey)
  
  // Update active users count
  const activeSessions = await redis.scard("sessions:active")
  await redis.set("metrics:activeUsers", activeSessions)
}

export async function getActiveSessions(): Promise<UserSession[]> {
  const sessionKeys = await redis.smembers("sessions:active")
  const sessions = await Promise.all(
    sessionKeys.map(async (key) => {
      const data = await redis.get(key)
      return data ? JSON.parse(data as string) : null
    })
  )
  
  return sessions.filter(Boolean)
}

export async function endUserSession(userId: string, deviceId: string) {
  const sessionKey = `session:user:${userId}:${deviceId}`
  await redis.del(sessionKey)
  await redis.srem("sessions:active", sessionKey)
  
  // Update active users count
  const activeSessions = await redis.scard("sessions:active")
  await redis.set("metrics:activeUsers", activeSessions)
}

// =====================
// STREAM HEALTH
// =====================

export async function updateStreamHealth(channelId: string, health: Partial<StreamHealth>) {
  const key = `stream:health:${channelId}`
  const current = await redis.get(key)
  
  const updated = {
    ...(current ? JSON.parse(current as string) : {}),
    ...health,
    channelId,
    lastUpdate: Date.now(),
  }
  
  await redis.set(key, JSON.stringify(updated), { ex: 300 }) // 5 min TTL
}

export async function getStreamHealth(channelId: string): Promise<StreamHealth | null> {
  const data = await redis.get(`stream:health:${channelId}`)
  return data ? JSON.parse(data as string) : null
}

export async function getAllStreamHealth(): Promise<StreamHealth[]> {
  const keys = await redis.keys("stream:health:*")
  const health = await Promise.all(
    keys.map(async (key) => {
      const data = await redis.get(key)
      return data ? JSON.parse(data as string) : null
    })
  )
  
  return health.filter(Boolean)
}

// =====================
// ALERTS
// =====================

export async function createAlert(alert: Omit<Alert, "id" | "timestamp">) {
  const id = `alert:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
  const fullAlert: Alert = {
    ...alert,
    id,
    timestamp: Date.now(),
  }
  
  await redis.set(id, JSON.stringify(fullAlert), { ex: 86400 }) // 24h TTL
  await redis.lpush("alerts:list", id)
  await redis.ltrim("alerts:list", 0, 99) // Keep last 100
  
  return fullAlert
}

export async function getAlerts(limit = 20): Promise<Alert[]> {
  const alertIds = await redis.lrange("alerts:list", 0, limit - 1)
  const alerts = await Promise.all(
    alertIds.map(async (id) => {
      const data = await redis.get(id)
      return data ? JSON.parse(data as string) : null
    })
  )
  
  return alerts.filter(Boolean)
}

export async function resolveAlert(alertId: string) {
  const data = await redis.get(alertId)
  if (data) {
    const alert = JSON.parse(data as string)
    alert.resolved = true
    alert.resolvedAt = Date.now()
    await redis.set(alertId, JSON.stringify(alert), { ex: 86400 })
  }
}

// =====================
// AGGREGATIONS
// =====================

export async function aggregateHourlyMetrics() {
  const now = Date.now()
  const hourAgo = now - 3600000
  
  const metrics = await getCurrentMetrics()
  const hourKey = `metrics:hourly:${Math.floor(now / 3600000)}`
  
  await redis.set(hourKey, JSON.stringify(metrics), { ex: 604800 }) // Keep for 7 days
}

export async function getDailyStats(days = 7) {
  const stats = []
  const now = Date.now()
  
  for (let i = 0; i < days; i++) {
    const timestamp = now - i * 86400000
    const dayKey = `metrics:daily:${Math.floor(timestamp / 86400000)}`
    const data = await redis.get(dayKey)
    
    if (data) {
      stats.push(JSON.parse(data as string))
    }
  }
  
  return stats.reverse()
}
