const activeSessions = new Map<string, string>()

export function sessionLock(userId: string, sessionId: string) {
  const existing = activeSessions.get(userId)

  if (existing && existing !== sessionId) {
    return false // autre appareil → refus
  }

  activeSessions.set(userId, sessionId)
  return true
}
