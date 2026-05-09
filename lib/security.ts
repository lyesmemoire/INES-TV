/**
 * 🕵️ Bot Detection Whitelist (EDGE COMPATIBLE)
 * Ces fonctions ne dépendent pas des modules Node.js (comme crypto)
 * et peuvent être utilisées dans le Middleware et les Client Components.
 */
export function isLegitCrawler(userAgent: string): boolean {
  if (!userAgent) return false
  const bots = ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider']
  return bots.some(bot => userAgent.includes(bot))
}
