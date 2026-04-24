import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const r = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM public."Channel"');
  console.log(JSON.stringify(r));
}
run().finally(() => prisma.$disconnect());
