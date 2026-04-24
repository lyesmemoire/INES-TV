import 'dotenv/config';
import { startIptvSyncScheduler } from './server/cron/iptvSync.cron.js';
import { startSourcePoolScheduler } from './server/cron/sourcePool.cron.js';
import { startDiscoveryScheduler } from './server/cron/discovery.cron.js';
import { startStreamMonitor } from './server/cron/streamMonitor.cron.js';
import { startTrafficBotScheduler } from './server/cron/trafficBot.cron.js';
import logger from './server/services/logger.js';

/**
 * 🤖 DEDICATED OTT BACKGROUND WORKER
 * Independent process for EPG sync, monitoring and intelligence gathering.
 * This relieves the API server from heavy background processing.
 */

async function startWorker() {
  console.log('\n\x1b[34m[Worker]\x1b[0m Starting background services...');
  
  // 1. Ingestion & Sync
  startIptvSyncScheduler();
  
  // 2. Monitoring & Health
  startStreamMonitor();
  
  // 3. Source Discovery & Intelligence
  startSourcePoolScheduler();
  startDiscoveryScheduler();
  
  // 4. Optimization Bots
  startTrafficBotScheduler();

  logger.info('[Worker] All background schedulers are ACTIVE.');
}

startWorker().catch((err) => {
  logger.error(`[Worker] Fatal startup error: ${err.message}`);
  process.exit(1);
});
