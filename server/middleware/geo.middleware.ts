export function getCountryFromIP(ip: string): string {
  if (!ip) return "OTHER"

  if (ip.startsWith("102.") || ip.startsWith("41.")) return "DZ"
  if (ip.startsWith("8.")) return "US"

  // Cloudflare headers → cf-ipcountry will be supported here
  return "OTHER"
}
