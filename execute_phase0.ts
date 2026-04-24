import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sql = `
-- =========================
-- PHASE 0 - FINAL ALIGNMENT
-- =========================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TENANT
CREATE TABLE IF NOT EXISTS public."Tenant" (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    slug text UNIQUE,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- TENANT USER (CUID bridge temporaire)
CREATE TABLE IF NOT EXISTS public."TenantUser" (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" uuid REFERENCES public."Tenant"(id) ON DELETE CASCADE,
    "userId" text,
    role text DEFAULT 'member',
    created_at timestamp DEFAULT now()
);

-- STREAM SESSION
CREATE TABLE IF NOT EXISTS public."StreamSessionLive" (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "channelId" text,
    "userId" text,
    started_at timestamp DEFAULT now(),
    ended_at timestamp,
    quality text,
    device text
);

-- INDEXS
CREATE INDEX IF NOT EXISTS idx_tenant_user_tenant ON public."TenantUser"("tenantId");
CREATE INDEX IF NOT EXISTS idx_tenant_user_user ON public."TenantUser"("userId");
CREATE INDEX IF NOT EXISTS idx_stream_session_user ON public."StreamSessionLive"("userId");

-- CHECK
SELECT 'Tenant' as table, count(*)::int FROM public."Tenant"
UNION ALL
SELECT 'TenantUser', count(*)::int FROM public."TenantUser"
UNION ALL
SELECT 'StreamSessionLive', count(*)::int FROM public."StreamSessionLive";
`;

async function run() {
  try {
    console.log('Executing Phase 0 Alignment SQL...');
    // We use a trick to run multiple statements if the driver supports it, 
    // or we split by semicolon. Prisma $executeRawUnsafe usually supports multiple statements in one call for Postgres.
    const results = await prisma.$queryRawUnsafe(sql);
    console.log('EXECUTION SUCCESSFUL');
    console.log(JSON.stringify(results, null, 2));
  } catch (e: any) {
    console.error('EXECUTION FAILED:', e.message);
    process.exit(1);
  }
}

run().finally(() => prisma.$disconnect());
