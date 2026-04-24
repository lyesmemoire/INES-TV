import { redis } from "./redis.service";

export async function shouldScaleUp() {
  const totalLoad = parseInt(await redis.get("global:load") || "0");

  return totalLoad > 500; // seuil
}

export async function registerNode(nodeId: string) {
  await redis.set(`node:${nodeId}:active`, "1", "EX", 30);
}
