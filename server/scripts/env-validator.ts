/**
 * ENV VALIDATOR — Production MVP
 * Fails fast at startup if critical variables are missing.
 */
const requiredEnv = [
  "NODE_ENV",
  "PORT",
  "JWT_SECRET",
  "REDIS_URL",
  "STREAM_SECRET",
  "STREAM_ENCRYPT_KEY",
  "CDN_PRIMARY",
  "DATABASE_URL",
  "CRON_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredEnv) {
    if (!process.env[key] || process.env[key] === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error("❌ ENV VALIDATION FAILED — Missing variables:");
    missing.forEach((v) => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log("✅ ENV VALID");
}
