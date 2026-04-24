import { prisma } from './server/services/db.js';

async function main() {
  const sources = await prisma.m3uSource.findMany();
  console.log('Channels in DB:', await prisma.channel.count());
  console.log('Sources in DB:', JSON.stringify(sources, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
