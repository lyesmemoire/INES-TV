export function getUserSegment(req: any): string {
  const watchTime = req.headers["x-watch-time"] || 0
  const qoe = req.headers["x-qoe"] || 100
  const country = req.headers["cf-ipcountry"] || "XX"

  let score = 0

  score += Math.min(Number(watchTime) / 60, 10)
  score += Number(qoe) / 10

  if (["US", "FR", "DE", "UK"].includes(country)) {
    score += 5
  }

  if (score > 15) return "premium"
  if (score > 8) return "standard"
  return "low"
}
