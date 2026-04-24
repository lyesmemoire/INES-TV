import express from 'express';
console.log('[Diagnostic] Express loaded OK');

// Test 1: Critical Middlewares
import { requestLogger } from './server/middleware/requestLogger.js';
console.log('[Diagnostic] RequestLogger loaded OK');

// Test 2: Routers one by one
import channelsRouter from './server/routes/channels.js';
console.log('[Diagnostic] ChannelsRouter loaded OK');

import { authRouter } from './server/routes/auth.js';
console.log('[Diagnostic] AuthRouter loaded OK');

import streamsRouter from './server/routes/streams.js';
console.log('[Diagnostic] StreamsRouter loaded OK');

import adminRouter from './server/routes/admin.js';
console.log('[Diagnostic] AdminRouter loaded OK');

import healthRouter from './server/routes/health.js';
console.log('[Diagnostic] HealthRouter loaded OK');

import { favoritesRouter } from './server/routes/favorites.js';
console.log('[Diagnostic] FavoritesRouter loaded OK');

import { historyRouter } from './server/routes/history.js';
console.log('[Diagnostic] HistoryRouter loaded OK');

import recommendationsRouter from './server/routes/recommendations.js';
console.log('[Diagnostic] RecommendationsRouter loaded OK');

import { m3uRouter } from './server/routes/m3u.js';
console.log('[Diagnostic] M3URouter loaded OK');

import adsRouter from './server/routes/ads.js';
console.log('[Diagnostic] AdsRouter loaded OK');

import adsTrackingRouter from './server/routes/adsTracking.js';
console.log('[Diagnostic] AdsTrackingRouter loaded OK');

import metricsRouter from './server/routes/admin/metrics.js';
console.log('[Diagnostic] MetricsRouter loaded OK');

import { errorHandler } from './server/middleware/errorHandler.js';
console.log('[Diagnostic] ErrorHandler loaded OK');

console.log('[Diagnostic] ALL MODULES LOADED SUCCESSFULY! The error must be in the logic of server.ts itself.');
