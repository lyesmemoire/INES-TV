import { getEngineMetrics } from "./loadBalancer.service"

let KILL_SWITCH = false

export function toggleKillSwitch(state: boolean) {
  KILL_SWITCH = state
}

export function isKilled() {
  return KILL_SWITCH
}

export async function getAdminMetrics() {
  const engine = await getEngineMetrics()

  return {
    success: true,
    data: {
      ...engine,
      killSwitch: KILL_SWITCH
    }
  }
}
