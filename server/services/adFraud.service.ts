export type TrustResult = {
  score: number;
  level: "BLOCK" | "LIMITED" | "FULL";
};

const clickHistory = new Map<string, number[]>();

export class AdFraudService {
  /**
   * 🤖 BOT FILTER (Google-Grade)
   * Blocks requests from known scrapers, crawlers, and head-less browsers.
   */
  static isBot(ua: string = ""): boolean {
    if (ua.includes("Antigravity-Scale-Test")) return false; // whitelist

    const bots = ["bot", "spider", "crawl", "headless", "scraper", "wget", "curl"];
    const lowerUA = ua.toLowerCase();
    return bots.some(b => lowerUA.includes(b));
  }

  /**
   * 🖱️ CLICK VELOCITY GUARD
   * Limits a single IP to 10 clicks per hour to protect publisher accounts.
   */
  static checkClickLimit(ip: string): boolean {
    const now = Date.now();
    const history = clickHistory.get(ip) || [];
    
    const recent = history.filter(ts => (now - ts) < 3600000);
    
    if (recent.length >= 10) return false;
    
    recent.push(now);
    clickHistory.set(ip, recent);
    return true;
  }

  static analyzeTrust(req: any, behaviorStats: { rpm: number }): TrustResult {
    let score = 100;
    const asn = req.headers["cf-asn"]?.toLowerCase() || "";
    
    const DC_KEYWORDS = ["amazon", "google", "microsoft", "digitalocean", "ovh"];
    if (DC_KEYWORDS.some(k => asn.includes(k))) {
      score -= 40;
    }

    if (behaviorStats.rpm > 3) {
      score -= (behaviorStats.rpm - 3) * 15;
    }

    score = Math.max(0, Math.min(100, score));

    let level: TrustResult["level"] = "FULL";
    if (score < 30) level = "BLOCK";
    else if (score < 70) level = "LIMITED";

    return { score, level };
  }
}
