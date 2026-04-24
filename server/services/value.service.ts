export function estimateUserValue(profile: any) {
  const sessions = profile.sessions || 0;

  if (sessions > 50) return "HIGH";
  if (sessions > 10) return "MEDIUM";

  return "LOW";
}
