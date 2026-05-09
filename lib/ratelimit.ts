/**
 * 🛡️ SIMPLE VPS RATE LIMITER (In-Memory)
 * Idéal pour les déploiements sur serveur unique.
 * Évite les dépendances externes comme Upstash/Redis.
 */

const requests = new Map<string, number[]>()

// 🧹 Nettoyage automatique toutes les 10 minutes pour éviter les fuites mémoire
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const windowMs = 10000
    for (const [ip, timestamps] of requests.entries()) {
      const filtered = timestamps.filter(t => now - t < windowMs)
      if (filtered.length === 0) {
        requests.delete(ip)
      } else {
        requests.set(ip, filtered)
      }
    }
  }, 600000) // 10 minutes
}

export function rateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 10000 // Fenêtre de 10 secondes
  const maxRequests = 50  // 50 requêtes max par fenêtre

  if (!requests.has(ip)) {
    requests.set(ip, [])
  }

  // Nettoyage des anciens timestamps
  const timestamps = requests.get(ip)!.filter(t => now - t < windowMs)

  if (timestamps.length >= maxRequests) {
    return false
  }

  // Ajout du nouveau timestamp
  timestamps.push(now)
  requests.set(ip, timestamps)

  return true
}
