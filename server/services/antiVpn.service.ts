export type RiskResult = {
  isVpn: boolean;
  score: number;
};

const DATACENTER_KEYWORDS = [
  "amazon",
  "google",
  "microsoft",
  "digitalocean",
  "ovh",
  "oracle",
  "vultr"
];

const ipHistory = new Map<string, number>();

function isSuspiciousIp(ip: string) {
  return ip.startsWith("10.") || ip.startsWith("172.");
}

function isIpRotating(ip: string) {
  const now = Date.now();
  const last = ipHistory.get(ip) || 0;
  ipHistory.set(ip, now);
  return now - last < 2000;
}

export function analyzeIp(headers: any): RiskResult {
  let score = 0;

  const ip = headers["cf-connecting-ip"] || "";
  const country = headers["cf-ipcountry"] || "";
  const asn = headers["cf-asn"] || "";
  
  // 1. ASN detection
  if (DATACENTER_KEYWORDS.some(k => asn.toLowerCase().includes(k))) {
    score += 40;
  }

  // 2. Suspicious country mismatch
  if (country === "XX" || country === "T1") {
    score += 30;
  }

  // 3. Entropy IP pattern
  if (isSuspiciousIp(ip)) {
    score += 20;
  }

  // 4. Fast switching heuristic
  if (isIpRotating(ip)) {
    score += 30;
  }

  return {
    isVpn: score >= 50,
    score
  };
}
