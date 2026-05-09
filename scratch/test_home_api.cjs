const { EditorialService } = require('../src/services/EditorialService');
const { prisma } = require('../lib/prisma');

async function test() {
  console.log('--- Testing Editorial Dual-Source Logic ---');
  
  const matches = await EditorialService.getHeroMatches();
  console.log('Result Count:', matches.length);
  console.log('First Match ID:', matches[0]?.id);
  console.log('First Match Name:', matches[0]?.name);
  
  if (matches[0]?.id.includes('legacy')) {
    console.log('✅ Result: Currently using LEGACY fallback (Correct as no featured matches in DB)');
  } else {
    console.log('ℹ️ Result: Currently using DB source');
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
