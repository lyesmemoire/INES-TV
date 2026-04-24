import { randomUUID } from "crypto"

export type Provider = {
  name: string
  baseEcpm: number
  isPremium?: boolean
  score: number // EMA score (0..inf)
  successRate: number // 0..1 (last N)
}

export type Context = {
  qoe: number
  geo: string
  userValue: number
  now: Date
  lastProvider?: string
}

const GEO_MULT: Record<string, number> = { US: 2.5, FR: 1.5, UK: 2.0, CA: 2.2, DZ: 0.6, IN: 0.4 }
const EMA_ALPHA = 0.2

function timeMultiplier(now: Date) {
  const h = now.getUTCHours()
  if (h >= 18 && h <= 23) return 1.4
  if (h >= 12 && h <= 14) return 1.2
  return 0.9
}

function dynamicFloor(qoe: number, geo: string) {
  let f = 0.8
  if (geo === "US") f *= 1.5
  if (geo === "FR") f *= 1.2
  if (qoe > 80) f *= 1.3
  if (qoe < 60) f *= 0.7
  return f
}

function adjustedEcpm(p: Provider, ctx: Context) {
  const geo = GEO_MULT[ctx.geo] || 1
  const time = timeMultiplier(ctx.now)
  const perf = 0.5 + 0.5 * p.successRate // 0.5..1
  return p.baseEcpm * geo * time * perf * (1 + p.score * 0.1)
}

function rankProviders(providers: Provider[], ctx: Context) {
  return providers
    .map(p => ({ p, ecpm: adjustedEcpm(p, ctx) }))
    .sort((a, b) => b.ecpm - a.ecpm)
}

function shouldAllowProvider(p: Provider, ctx: Context) {
  const floor = dynamicFloor(ctx.qoe, ctx.geo)
  if (adjustedEcpm(p, ctx) < floor) return false
  if (ctx.userValue > 80 && !p.isPremium) return false
  return true
}

// simulate network call (replace with real SDK/ad fetch in frontend or proxy logic)
// In this backend iteration, we probabilistically decide availability for the "dumb" client.
async function tryFill(p: Provider): Promise<{ ok: boolean; revenue?: number }> {
  // pseudo success based on successRate
  const ok = Math.random() < p.successRate
  if (!ok) return { ok: false }
  
  // revenue proxy around baseEcpm
  const revenue = p.baseEcpm * (0.8 + Math.random() * 0.4)
  return { ok: true, revenue }
}

export async function runWaterfall(
  providers: Provider[],
  ctx: Context,
  onResult: (name: string, ok: boolean, revenue?: number) => void
) {
  const ranked = rankProviders(providers, ctx)

  for (const { p } of ranked) {
    if (p.name === ctx.lastProvider) continue; // SMART ROTATION

    if (!shouldAllowProvider(p, ctx)) continue

    const res = await tryFill(p)
    onResult(p.name, res.ok, res.revenue)

    if (res.ok) {
      return {
        provider: p.name,
        revenue: res.revenue!,
      }
    }
  }

  return { provider: null, revenue: 0 }
}

// EMA update (call after each result)
export function updateProviderScore(p: Provider, revenue: number) {
  p.score = EMA_ALPHA * revenue + (1 - EMA_ALPHA) * p.score
}
