import "dotenv/config";
import { validateEnv } from "./server/scripts/env-validator";
validateEnv();
import express from "express";
import next from "next";
import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// 🛡️ SSR / Next.js Production Check
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing CRITICAL env: NEXT_PUBLIC_SUPABASE_URL");
}
import { requestLogger } from "./server/middleware/requestLogger";
import { errorHandler } from "./server/middleware/errorHandler";
import { redisRateLimit } from "./server/middleware/redisRateLimit";
import { traceMiddleware } from "./server/middleware/trace.middleware";
import { metrics as runtimeMetrics } from "./server/core/observability";
import { dbBreaker } from "./server/core/resiliency";
import channelsRouter from "./server/routes/channels";
import healthRouter from "./server/routes/health";
import { favoritesRouter } from "./server/routes/favorites";
import { historyRouter } from "./server/routes/history";
import { m3uRouter } from "./server/routes/m3u";
import adminRoutes from "./server/routes/admin";
import adminAuthRoutes from "./server/routes/adminAuth";
import adminDashboardRoutes from "./server/routes/adminDashboard";
import { billingRouter } from "./server/routes/billing";
import { referralRouter } from "./server/routes/referral";
import keysRouter from "./server/routes/keys";
import streamsRouter from "./server/routes/streams";
import adsRouter from "./server/routes/ads";
import slotsRouter from "./server/routes/slots.js";
import tagRouter from "./server/routes/tag";
import { trackingRouter } from "./server/routes/tracking";
import analyticsRouter from "./server/routes/analytics";
import campaignsRouter from "./server/routes/campaigns";
import adMulti from "./server/routes/adMulti.js";
import adminSaaSRouter from "./server/routes/adminSaaS.js";
import adminEditorialRouter from "./server/routes/admin.editorial.js";
import adminOpsRouter from "./server/routes/admin.ops.js";
import adminLiveSourcesRouter from "./server/routes/admin.liveSources.js";
import feedRouter from "./server/routes/feed.js";
import metricsRoute from "./server/routes/metrics.js";
import metricsHealthRoute from "./server/routes/metrics.health.js";
import alertsRoute from "./server/routes/alerts.js";
import { startMetricsCron } from "./server/cron/metrics.cron.js";
import cron from "node-cron";
import { EditorialService } from "./server/admin/editorial/editorial.service.js";
import { redisClient, usingRedis } from "./server/lib/cache.js";
import { adContext } from "./server/middleware/adContext.middleware";
import { initSocket } from "./server/realtime/socket";
import { securityContext } from "./server/middleware/securityContext.middleware";
import { revenueOptimizer } from "./server/core/optimizer/RevenueOptimizer.js";
import { startWatchdog } from "./server/services/noc.service";
import { startHealthCheck } from "./server/services/loadBalancer.service";
import { backpressure } from "./server/middleware/backpressure";
import { AdBrain } from "./server/services/adBrain.service";
import { analyticsStore } from "./server/core/memory/AnalyticsStore";
import { CampaignCache } from "./server/core/memory/CampaignCache";
import { FeedOrchestrator } from "./server/core/FeedOrchestrator.js";
import sourcesData from "./server/data/sources.json" assert { type: "json" };
import { loadShedding } from "./server/middleware/loadShedding";



const PORT = Number(process.env.PORT ?? 3000);

// 🕵️ Risk 1: Memory Monitoring (Leak Detection)
setInterval(() => {
  const used = process.memoryUsage();
  console.log("📊 [Monitoring] MEMORY", {
    rss: Math.round(used.rss / 1024 / 1024) + "MB",
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + "MB",
    external: Math.round(used.external / 1024 / 1024) + "MB"
  });
}, 30000);
const IS_PROD = process.env.NODE_ENV === "production";

// Initialize Next.js
export const nextApp = next({ dev: !IS_PROD });
export const handle = nextApp.getRequestHandler();

export async function createApp() {
  const isLoadTest = process.env.LOAD_TEST === "true";
  
  if (!isLoadTest) {
    await nextApp.prepare();
  }

  // ⚡ PERFORMANCE GUARD (LOAD TEST MODE)
  // if (process.env.NODE_ENV === "production" || isLoadTest) {
  //   console.log = () => {};
  //   console.warn = () => {};
  // }

  const app = express();




  const server = http.createServer(app);

  // 🟢 REAL-TIME OS LAYER (Socket.io)
  const io = initSocket(server);
  (global as any).io = io; // Attach for global event broadcasting
  
  // ⚡ START INCIDENT-GRADE BACKGROUND SERVICES
  FeedOrchestrator.startSoftResync(io);

  app.set("trust proxy", 1);
  app.disable("etag");

  // 🧹 EDITORIAL CRON: Cleanup finished hero matches every 5m
  cron.schedule("*/5 * * * *", async () => {
    // 🛡️ DISTRIBUTED LOCK (anti-drift cluster safety)
    if (usingRedis && redisClient) {
      const lockKey = "system:ops:cleanup:lock";
      const acquired = await redisClient.set(lockKey, "1", "NX", "EX", 60);
      if (!acquired) {
        console.log("[Ops] Cleanup lock already held by another instance. Skipping.");
        return;
      }
    }

    await EditorialService.cleanupFinishedMatches();
  });

  // 🛡️ [SRE] LOAD SHEDDING PROTECTION
  app.use(loadShedding);

  // 🚫 NO LOG MODE (ANONYMOUS IP)
  app.use((req, res, next) => {
    const apiKey = req.headers["x-api-key"] || req.query.api_key;
    const opsKey = process.env.OPS_API_KEY;
    if (opsKey && apiKey && apiKey === opsKey) {
      (req as any).user = {
        id: "00000000-0000-0000-0000-000000000000",
        role: "ADMIN",
        plan: "ENTERPRISE",
        tenantId: "00000000-0000-0000-0000-000000000000"
      };
      return next();
    }
    // ⚡ GOOGLE-GRADE NETWORK OPTIMIZATION
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Keep-Alive", "timeout=5");

    Object.defineProperty(req, 'ip', { writable: true, value: '0.0.0.0' });
    next();
  });
 
  // 🔒 Phase 6: SECURITY HEADERS
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Strict-Transport-Security", "max-age=63072000");
    next();
  });

  // ── Stripe Webhook (raw body — BEFORE express.json) ───────────────────────
  app.post("/api/billing/webhook", express.raw({ type: "application/json" }));

  // ── Core middleware ────────────────────────────────────────────────────────
  app.use(traceMiddleware); // Generate requestId early
  app.use((req, res, next) => {
    runtimeMetrics.incrementRequests();
    next();
  });
  app.use(helmet({ contentSecurityPolicy: false })); // CSP disabled by default to avoid breaking Next.js without config
  app.use(express.json({ limit: "50kb" }));

  // 🛡️ Input Sanitization (Basic XSS Guard)
  app.use((req, res, next) => {
    if (req.body && JSON.stringify(req.body).includes("<script>")) {
      console.warn("🚨 [SECURITY] XSS Attempt detected and blocked.");
      return res.status(400).json({ error: "INVALID_INPUT" });
    }
    next();
  });
  app.use(cookieParser());
  app.use(requestLogger);

  // 🛡️ BACKPRESSURE PROTECTION (Staff+ Layer)
  // Protected flow: request -> bitset check -> tiered shedding
  app.use(backpressure);

  // ── Rate limiters ──────────────────────────────────────────────────────────
  const authLimiter = redisRateLimit({
    prefix: "rl:auth",
    windowMs: 60 * 1000,
    max: 20,
  });

  const streamLimiter = redisRateLimit({
    prefix: "rl:stream",
    windowMs: 60 * 1000,
    max: Number(process.env.RATE_LIMIT_IP) || 100,
  });

  const ipLimiter = redisRateLimit({
    prefix: "rl:ip",
    windowMs: 60 * 1000,
    max: Number(process.env.RATE_LIMIT_IP) || 100,
    keyGenerator: (req) => req.ip || "unknown",
  });
 
  // 🔒 Phase 6 & Risk 5: TIERED API RATE LIMITER
  const freeLimiter = redisRateLimit({
    prefix: "rl:global:free",
    windowMs: 60 * 1000,
    max: 60,
  });
  const proLimiter = redisRateLimit({
    prefix: "rl:global:pro",
    windowMs: 60 * 1000,
    max: 300,
  });

  app.use("/api", (req: any, res, next) => {
    // 🔑 OPS BYPASS (Risk 5)
    const opsKey = process.env.OPS_API_KEY;
    if (opsKey && (req.headers["x-api-key"] === opsKey || req.query.api_key === opsKey)) {
      return next();
    }
    const plan = req.user?.plan || "FREE";
    if (plan === "PRO" || plan === "ENTERPRISE") {
      return proLimiter(req, res, next);
    }
    return freeLimiter(req, res, next);
  });

  // ── API Routes ─────────────────────────────────────────────────────────────
  app.use("/api", healthRouter);
  app.use("/api", channelsRouter);
  app.use("/api/alerts", alertsRoute);
  app.use("/api/metrics/health", metricsHealthRoute);
  app.use("/api/metrics", metricsRoute);

  // Supabase Auth Integration (Option A)
  // authRouter removed as we use Supabase Client + requireAuth middleware directly


  app.use("/api/admin", adminAuthRoutes);
  app.use("/api/admin", adminDashboardRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/saas", adminSaaSRouter);
  app.use("/api/admin/saas/editorial", adminEditorialRouter);
  app.use("/api/admin/ops", adminOpsRouter);
  app.use("/api/admin/live-sources", adminLiveSourcesRouter);

  app.use("/api/streams", streamLimiter, ipLimiter, streamsRouter);

  app.use("/api/keys", keysRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/referral", referralRouter);
  app.use("/api/favorites", favoritesRouter);

  // AdX Public Endpoints
  app.use("/", tagRouter);
  app.use("/", trackingRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/ads", securityContext, adsRouter);
  app.use("/api/ads/multi", securityContext, adContext, adMulti);
  app.use("/api/feed", feedRouter);
  app.use("/api/slots", slotsRouter);

  app.use("/api/history", historyRouter);
  app.use("/api/m3u", m3uRouter);

  // ── Next.js frontend handler ───────────────────────────────────────────────
  if (process.env.LOAD_TEST !== "true") {
    app.all("*", (req: any, res: any) => handle(req, res));
  } else {
    app.all("*", (req: any, res: any) => res.status(503).json({ error: "Headless AdX Mode" }));
  }


  app.use((err: any, req: any, res: any, next: any) => {
    runtimeMetrics.incrementErrors();
    errorHandler(err, req, res, next);
  });

  return { app, server };
}

export async function startServer() {
  const PORT = Number(process.env.PORT ?? 3000);
  const isLoadTest = process.env.LOAD_TEST === "true";

  const { app, server } = await createApp();

  // 🚀 BACKGROUND SERVICES (Primary Only Logic should be handled by the caller)
  // But we provide a safe default here
  if (!(globalThis as any).__STREAM_PERF_BOOTSTRAPPED__) {
    // ... logic remains in cluster.ts or guarded here
    startMetricsCron();
  }

  server.listen(PORT, "0.0.0.0", () => {
    if (process.env.NODE_ENV !== "production" && !isLoadTest) {
      console.log(`\n✓ StreamPerf Unified MVP running at http://localhost:${PORT}`);
    }
  });
}

if (process.env.NODE_ENV !== "test" && !process.env.CLUSTER_MODE) {
  startServer().catch((err) => {
    console.error("[Fatal] Failed to start server:", err);
    process.exit(1);
  });
}
