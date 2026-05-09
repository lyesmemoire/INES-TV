let lastAlertSent = 0;
let lastCriticalAlertSent = 0;
const ALERT_THROTTLE_MS = 60000;
const CRITICAL_THROTTLE_MS = 5 * 60000; // 5 mins

export async function sendAlert(type: string, payload: any, severity: string = "INFO") {
  const now = Date.now();
  
  if (severity === "CRITICAL") {
    if (now - lastCriticalAlertSent < CRITICAL_THROTTLE_MS) return;
    lastCriticalAlertSent = now;
  } else {
    if (now - lastAlertSent < ALERT_THROTTLE_MS) return;
    lastAlertSent = now;
  }

  // 🔐 Anti-Leak Security: Block alert if it contains sensitive patterns
  const payloadString = JSON.stringify(payload);
  const SENSITIVE_PATTERNS = [
    process.env.OPS_API_KEY,
    "postgres://",
    "Bearer ",
    "apikey",
  ];

  const containsSensitiveData = SENSITIVE_PATTERNS.some((pattern) =>
    pattern && payloadString.includes(pattern)
  );

  if (containsSensitiveData) {
    console.error("🚨 [SECURITY] Alert BLOCKED: Attempted to leak sensitive data (API Key / DB URL)");
    return;
  }

  console.warn(`🚨 [${severity}] ALERT TRIGGERED:`, type, payload);

  // 🔔 Slack Webhook (if configured)
  const slackUrl = process.env.ALERT_SLACK_WEBHOOK;
  if (slackUrl) {
    try {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 *[${severity}] ${type}*\n${JSON.stringify(payload, null, 2)}`,
          username: "INES TV Alerts",
          icon_emoji: severity === "CRITICAL" ? ":rotating_light:" : ":warning:"
        })
      });
    } catch (err) {
      console.error("[Alert] Slack delivery failed:", err);
    }
  }

  // 📧 Email Fallback (via generic webhook — configure in .env)
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, severity, payload, timestamp: new Date().toISOString() })
      });
    } catch (err) {
      console.error("[Alert] Webhook delivery failed:", err);
    }
  }
}
