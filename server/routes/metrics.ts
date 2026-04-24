import { Router } from "express";
import { getMetrics } from "../services/metrics.service.js";
import { cache } from "../lib/cache.js";
import { requireAuth, requireAdmin } from "../middleware/supabaseAuth.middleware.js";
import { redisRateLimit } from "../middleware/redisRateLimit.js";
import { trackUsage } from "../services/usage.service.js";
import { enforceQuota } from "../middleware/billing.guard.js";
import logger from "../services/logger.js";
import { dbBreaker } from "../core/resiliency.js";

const router = Router();

// ==========================================
// 🛡️ SaaS MONETIZATION & HARDENING LAYER
// ==========================================
// Phase 10: DDoS / Rate limit specifically for metrics
const metricsLimiter = redisRateLimit({
  prefix: "rl:metrics",
  windowMs: 60 * 1000, 
  max: 60 // 1 per sec max normal
});

// Helper for Gating
function getPlanLimits(plan: string) {
  if (plan === "ENTERPRISE") return { refresh: 1000, features: ["ALL"] };
  if (plan === "PRO") return { refresh: 2000, features: ["realtime", "history", "alerting"] };
  return { refresh: 10000, features: ["basic"] }; // FREE
}

// ==========================================
// 🛡️ CIRCUIT BREAKER & STAMPEDE PROTECTION
// ==========================================
let lastKnownGood: any = {
  activeStreams: 0,
  avgLatency: 0,
  errors: 0,
  errorRate: 0,
  topChannels: [],
  errorRateFormatted: "0.00%",
  p95Latency: 0,
  anomaly: "OK",
  healthScore: 100,
  trend: "STABLE"
};
let lastFetch = 0;
const LKG_TTL = 5000;
const metricsLocks = new Map<string, Promise<any>>();
 
async function getMetricsSafe(tenantId?: string) {
  const now = Date.now();
  const cacheKey = `metrics:global${tenantId ? ':' + tenantId : ''}`;
 
  // 1. Circuit Breaker: Return LKG if within TTL to avoid DB hammer
  if (now - lastFetch < LKG_TTL && lastKnownGood) {
    return lastKnownGood;
  }
 
  // 2. Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
    if (!tenantId) {
        lastKnownGood = data;
        lastFetch = now;
    }
    return data;
  }
 
  // 3. Stampede Protection: Check if a fetch is already in flight
  if (metricsLocks.has(cacheKey)) {
    return metricsLocks.get(cacheKey);
  }
 
  // 4. Perform fetch with Circuit Breaker and LKG fallback
  const fetchPromise = dbBreaker.execute(async () => {
    try {
      const m = await getMetrics(tenantId);
      await cache.set(cacheKey, JSON.stringify(m), 5); // 5s TTL per Phase 7
      
      lastKnownGood = m;
      lastFetch = now;
      return m;
    } catch (err) {
      throw err;
    } finally {
      metricsLocks.delete(cacheKey);
    }
  }, () => {
    logger.warn("🚨 [CircuitBreaker] DB FAIL / OPEN → returning Last Known Good");
    return lastKnownGood;
  });
 
  metricsLocks.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// ==========================================
// 📊 V1 - STANDARD POLLING METRICS
// ==========================================
router.get("/", requireAuth, requireAdmin, metricsLimiter, async (req: any, res: any) => {
  try {
    const tenantId = req.user?.tenantId;
    const plan = req.user?.plan || "FREE";
    const limits = getPlanLimits(plan);

    // Phase 10: Optional API Key support (bypasses plan checks for programmatic access)
    const isApiKeyHit = req.headers["x-api-key"] === process.env.OPS_API_KEY;

    // 🔥 Phase 5: B2B Usage Tracking & Enforcement
    if (tenantId && !isApiKeyHit) {
       await enforceQuota(tenantId);
       await trackUsage(tenantId, "metrics");
    }

    // Cache check
    const cacheKey = `metrics:global${tenantId ? ':' + tenantId : ''}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached);


    const metrics = await getMetricsSafe(tenantId);
    
    // Phase 9: Smart Insights (Anomaly & Health)
    const anomaly = metrics.avgLatency > (1200 * 2) ? "ANOMALY" : "OK"; // Using 1200 as base heuristic
    const healthScore = Math.max(0, 100 - (metrics.errorRate * 100) - (metrics.avgLatency / 50));
    const p95Latency = metrics.avgLatency > 0 ? metrics.avgLatency * 1.5 : 0; 
    
    // Trend analysis relies on historical data. For immediate polling, we approximate.
    const trend = "STABLE"; 

    const payload = {
      ...metrics,
      errorRateFormatted: `${(metrics.errorRate * 100).toFixed(2)}%`,
      p95Latency,
      anomaly,
      healthScore,
      trend,
      planRestricted: !isApiKeyHit && plan === "FREE"
    };

    // 🚨 Phase 9: ALERT CRITIQUE (FAILSAFE)
    if (healthScore < 50) {
       import("../services/alert.service.js").then(({ sendAlert }) => {
          sendAlert("CRITICAL_SYSTEM_FAILURE", { healthScore, latency: metrics.avgLatency, errorRate: metrics.errorRate }, "CRITICAL");
       });
    }

    await cache.set(cacheKey, JSON.stringify(payload), 5); // Phase 7: 5s TTL

    logger.info({
      event: "metrics_request",
      latency: metrics.avgLatency,
      tenantId,
      cache: cached ? "hit" : "miss"
    });

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Metrics failed" });
  }
});

// 🛡️ Phase 11: SSE Backpressure & Connection Safety
let activeSseClients = 0;
const MAX_SSE_CLIENTS = 1000;

// ==========================================
// ⚡ V2 - SERVER SENT EVENTS (SSE REALTIME)
// ==========================================
router.get("/stream", (req: any, res: any) => {
  if (activeSseClients >= MAX_SSE_CLIENTS) {
    return res.status(503).json({ 
      error: "SERVICE_UNAVAILABLE", 
      message: "Server is at maximum SSE capacity. Try again later." 
    });
  }

  activeSseClients++;
  const plan = req.user?.plan || "FREE";
  
  // Phase 8: SaaS Gating
  const opsKey = process.env.OPS_API_KEY;
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (opsKey && apiKey === opsKey) {
      // OPS bypass
  } else if (plan === "FREE") {
      return res.status(403).json({ error: "UPGRADE_REQUIRED", message: "SSE Real-Time stream requires PRO or ENTERPRISE" });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const tenantId = req.user?.tenantId;
  const refreshRate = getPlanLimits(plan).refresh;

  // 🔥 Phase 5: B2B Usage Tracking & Enforcement
  if (tenantId && req.headers["x-api-key"] !== process.env.OPS_API_KEY) {
     enforceQuota(tenantId).then(() => trackUsage(tenantId, "sse")).catch(e => {
       res.status(402).json({ error: e.message || "PAYMENT_REQUIRED" });
     });
  }

  const interval = setInterval(async () => {
    try {
      // ⚡ PRODUCTION HARDENING: Use safe fetch with LKG fallback to avoid DB pool exhaustion
      const metrics = await getMetricsSafe(tenantId);
      
      const anomaly = (metrics as any).avgLatency > 2000 ? "HIGH_LATENCY_ANOMALY" : "OK";
      const healthScore = Math.max(0, 100 - ((metrics as any).errorRate * 100) - ((metrics as any).avgLatency / 50));
      const payload = { ...metrics as any, anomaly, healthScore };

      logger.info({
        event: "sse_metrics_push",
        tenantId,
        latency: (metrics as any).avgLatency
      });
      
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (e) {
      logger.error('SSE Error', { error: e });
    }
  }, refreshRate);

  req.on('close', () => {
    activeSseClients--;
    clearInterval(interval);
  });
});

export default router;
