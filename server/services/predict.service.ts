export function predictFailure(node: any) {
  if (node.load > (node.maxLoad || 1000) * 0.9) return true;
  if (node.latency > 800) return true;

  return false;
}
