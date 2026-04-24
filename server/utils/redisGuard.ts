/**
 * ⛽ REDIS OVERLOAD PROTECTION
 * Tracks operations per second to prevent saturation.
 */

let ops = 0;

// Reset counter every second
setInterval(() => {
  ops = 0;
}, 1000);

export function trackRedisOp() {
  ops++;

  const limit = Number(process.env.REDIS_MAX_OPS_PER_SEC || 5000);

  if (ops > limit) {
    if (ops % 100 === 0) {
      console.warn(`\x1b[33m[RedisGuard]\x1b[0m ⚠️ Threshold hit (${ops} ops/sec). Throttle activated.`);
    }
    return false;
  }

  return true;
}
