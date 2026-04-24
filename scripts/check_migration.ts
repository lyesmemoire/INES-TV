import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const q1 = await prisma.$queryRawUnsafe(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'StreamSessionLive';
  `);
  console.log("StreamSessionLive columns:", q1);

  const q2 = await prisma.$queryRawUnsafe(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'StreamEvent';
  `);
  console.log("StreamEvent columns:", q2);
}

check().catch(console.error).finally(() => prisma.$disconnect());
