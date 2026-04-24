export function systemGuard(metrics: {
  fillRate: number;
  revenue: number;
}) {
  if (metrics.fillRate < 0.3) {
    console.warn("🚨 SYSTEM GUARD: LOW FILL RATE");
    return { forceMultiplier: 0.8 };
  }

  return null;
}
