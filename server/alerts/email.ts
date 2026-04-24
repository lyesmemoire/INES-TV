import nodemailer from "nodemailer"

// Ignore strict configuration parsing if env missing for now
let transporter: any = null;
try {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ALERT_EMAIL_USER || "dummy@gmail.com",
      pass: process.env.ALERT_EMAIL_PASS || "dummy",
    },
  });
} catch(e) {}

export async function sendEmailAlert(alert: any) {
  if (alert.severity !== "CRITICAL") return
  if (!transporter || !process.env.ALERT_EMAIL_USER) return;

  await transporter.sendMail({
    from: "StreamPerf Alerts <alerts@streamperf.io>",
    to: process.env.OPS_EMAIL || "ops@streamperf.io",
    subject: `🚨 CRITICAL ALERT: ${alert.title}`,
    text: `
Tenant: ${alert.tenantId}
Type: ${alert.type}
Message: ${alert.message}
Value: ${alert.value}
Threshold: ${alert.threshold}
    `,
  }).catch(e => console.error("Email alert failed:", e.message))
}
