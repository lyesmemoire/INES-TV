const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matchCount = await prisma.match.count();
  console.log('Match count:', matchCount);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
