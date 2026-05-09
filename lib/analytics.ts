// =====================================================
// Analytics Module — In-Memory Fallback
// Provides all metrics, sessions, stream health, and
// alerts storage. Works without Redis for local dev.
// Drop-in replacement: all exports are unchanged.
// =====================================================

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
// IN-MEMORY STORE
// =====================

const store = {
  metrics: new Map<string, any>(),
  lists: new Map<string, any[]>(),
  sets: new Map<string, Set<string>>(),
}

function memGet(key: string) {
  return store.metrics.get(key) ?? null
}

function memSet(key: string, value: any) {
  store.metrics.set(key, value)
}

function memDel(key: string) {
  store.metrics.delete(key)
}

function memLpush(key: string, value: any) {
  const list = store.lists.get(key) ?? []
  list.unshift(value)
  store.lists.set(key, list)
}

function memLrange(key: string, start: number, stop: number) {
  const list = store.lists.get(key) ?? []
  return list.slice(start, stop + 1)
}

function memLtrim(key: string, start: number, stop: number) {
  const list = store.lists.get(key) ?? []
  store.lists.set(key, list.slice(start, stop + 1))
}

function memSadd(key: string, value: string) {
  const set = store.sets.get(key) ?? new Set()
  set.add(value)
  store.sets.set(key, set)
}

function memSrem(key: string, value: string) {
  const set = store.sets.get(key)
  if (set) set.delete(value)
}

function memScard(key: string) {
  return store.sets.get(key)?.size ?? 0
}

function memSmembers(key: string) {
  return Array.from(store.sets.get(key) ?? [])
}

function memKeys(pattern: string) {
  const prefix = pattern.replace("*", "")
  return Array.from(store.metrics.keys()).filter((k) => k.startsWith(prefix))
}

// =====================
// METRICS COLLECTION
// =====================

export async function recordMetric(key: string, value: number) {
  const timestamp = Date.now()
  const metricKey = `metric:${key}:${Math.floor(timestamp / 1000)}`

  memSet(metricKey, value)
  memLpush(`metrics:${key}:history`, JSON.stringify({ timestamp, value }))
  memLtrim(`metrics:${key}:history`, 0, 99)
}

export async function getMetricHistory(key: string, limit = 50): Promise<{ timestamp: number; value: number }[]> {
  const history = memLrange(`metrics:${key}:history`, 0, limit - 1)
  return history.map((item: string) => {
    try { return JSON.parse(item) } catch { return { timestamp: 0, value: 0 } }
  })
}

export async function getCurrentMetrics(): Promise<MetricSnapshot> {
  return {
    timestamp: Date.now(),
    activeUsers: Number(memGet("metrics:activeUsers") || 0),
    activeStreams: Number(memGet("metrics:activeStreams") || 0),
    cacheHitRate: Number(memGet("metrics:cacheHitRate") || 0),
    avgLatency: Number(memGet("metrics:avgLatency") || 0),
    errorRate: Number(memGet("metrics:errorRate") || 0),
    bandwidthUsage: Number(memGet("metrics:bandwidthUsage") || 0),
  }
}

// =====================
// USER SESSIONS
// =====================

export async function trackUserSession(session: UserSession) {
  const sessionKey = `session:user:${session.userId}:${session.deviceId}`
  memSet(sessionKey, JSON.stringify(session))

  memSadd("sessions:active", sessionKey)

  const activeSessions = memScard("sessions:active")
  memSet("metrics:activeUsers", activeSessions)
}

export async function getActiveSessions(): Promise<UserSession[]> {
  const sessionKeys = memSmembers("sessions:active")
  const sessions = sessionKeys.map((key) => {
    const data = memGet(key)
    try { return data ? JSON.parse(data as string) : null } catch { return null }
  })

  return sessions.filter(Boolean)
}

export async function endUserSession(userId: string, deviceId: string) {
  const sessionKey = `session:user:${userId}:${deviceId}`
  memDel(sessionKey)
  memSrem("sessions:active", sessionKey)

  const activeSessions = memScard("sessions:active")
  memSet("metrics:activeUsers", activeSessions)
}

// =====================
// STREAM HEALTH
// =====================

export async function updateStreamHealth(channelId: string, health: Partial<StreamHealth>) {
  const key = `stream:health:${channelId}`
  const current = memGet(key)

  const updated = {
    ...(current ? JSON.parse(current as string) : {}),
    ...health,
    channelId,
    lastUpdate: Date.now(),
  }

  memSet(key, JSON.stringify(updated))
}

export async function getStreamHealth(channelId: string): Promise<StreamHealth | null> {
  const data = memGet(`stream:health:${channelId}`)
  try { return data ? JSON.parse(data as string) : null } catch { return null }
}

export async function getAllStreamHealth(): Promise<StreamHealth[]> {
  const keys = memKeys("stream:health:")
  const health = keys.map((key) => {
    const data = memGet(key)
    try { return data ? JSON.parse(data as string) : null } catch { return null }
  })

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

  memSet(id, JSON.stringify(fullAlert))
  memLpush("alerts:list", id)
  memLtrim("alerts:list", 0, 99)

  return fullAlert
}

export async function getAlerts(limit = 20): Promise<Alert[]> {
  const alertIds = memLrange("alerts:list", 0, limit - 1)
  const alerts = alertIds.map((id) => {
    const data = memGet(id)
    try { return data ? JSON.parse(data as string) : null } catch { return null }
  })

  return alerts.filter(Boolean)
}

export async function resolveAlert(alertId: string) {
  const data = memGet(alertId)
  if (data) {
    try {
      const alert = JSON.parse(data as string)
      alert.resolved = true
      alert.resolvedAt = Date.now()
      memSet(alertId, JSON.stringify(alert))
    } catch { /* ignore */ }
  }
}

// =====================
// AGGREGATIONS
// =====================

export async function aggregateHourlyMetrics() {
  const now = Date.now()
  const metrics = await getCurrentMetrics()
  const hourKey = `metrics:hourly:${Math.floor(now / 3600000)}`

  memSet(hourKey, JSON.stringify(metrics))
}

export async function getDailyStats(days = 7) {
  const stats: any[] = []
  const now = Date.now()

  for (let i = 0; i < days; i++) {
    const timestamp = now - i * 86400000
    const dayKey = `metrics:daily:${Math.floor(timestamp / 86400000)}`
    const data = memGet(dayKey)

    if (data) {
      try { stats.push(JSON.parse(data as string)) } catch { /* ignore */ }
    }
  }

  return stats.reverse()
}
