export function segmentUser(u: {
  watchTime: number
  qoe: number
  geo: string
  requestsPerMin: number
}) {
  if (u.requestsPerMin > 5) return "FRAUD"

  let score = 0
  score += u.watchTime * 0.5
  score += u.qoe * 0.3

  if (u.geo === "US") score += 20
  if (u.geo === "FR") score += 10

  if (score > 80) return "HIGH_VALUE"
  if (score > 50) return "NORMAL"

  return "LOW_VALUE"
}
