export async function sendSlackAlert(alert: any) {
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!webhook) return

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `🚨 *${alert.severity} ALERT*  
*${alert.title}*  
Tenant: ${alert.tenantId}  
Message: ${alert.message}  
Value: ${alert.value}`,
    }),
  }).catch(e => console.error("Slack alert failed:", e.message))
}
