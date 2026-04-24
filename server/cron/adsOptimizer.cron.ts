import cron from "node-cron";
import { optimizeAdsWeights } from "../services/adsOptimizer.service";

/**
 * ⚡ CRON : AI Ads Optimizer
 * Exécution toutes les heures (0 * * * *)
 */
const job = cron.schedule("0 * * * *", async () => {
  console.log("[Cron] Running AI Ads Optimizer weighted re-scoring...");
  await optimizeAdsWeights();
});

export default job;
