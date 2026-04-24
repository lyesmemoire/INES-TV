export function scoreNode(node: any) {
  const loadScore = node.load / (node.maxLoad || 1000);
  const latencyScore = (node.latency || 0) / 100;

  return loadScore + latencyScore;
}
