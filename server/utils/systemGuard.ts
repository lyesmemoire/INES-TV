/**
 * 🛡️ SYSTEM GUARD
 * Multi-layer safety mechanism for Production operations.
 */

export function isKillSwitchActive() {
  return process.env.GLOBAL_KILL_SWITCH === "true";
}

/**
 * 🛑 CONTROL PLANE CHECK
 * Returns false if intelligence and scaling should be halted.
 */
export function checkControlPlane() {
  if (isKillSwitchActive()) {
    console.warn("\x1b[31m[Guard]\x1b[0m 🛑 CONTROL PLANE DISABLED (KILL SWITCH ACTIVE)");
    return false;
  }
  return true;
}

/**
 * 🔒 SAFE MODE CHECK
 * Returns true if the system should be in Shadow or Forced-Safe mode.
 */
export function isSafeMode() {
  return (
    process.env.SYSTEM_MODE === "shadow" ||
    process.env.SAFE_MODE === "true"
  );
}
