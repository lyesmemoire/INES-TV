import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
  try {
    const results = await prisma.$queryRawUnsafe(`
      SELECT 'Tenant' as table, count(*)::int FROM public."Tenant"
      UNION ALL
      SELECT 'TenantUser', count(*)::int FROM public."TenantUser"
      UNION ALL
      SELECT 'StreamSessionLive', count(*)::int FROM public."StreamSessionLive";
    `);
    console.log(JSON.stringify(results, null, 2));
  } catch (e: any) {
    console.error('SQL ERROR:', e.message);
    process.exit(1);
  }
}

verify().finally(() => prisma.$disconnect());
