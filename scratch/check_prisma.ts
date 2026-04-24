import { prisma } from './server/lib/prisma.js';

async function main() {
  try {
    const models = Object.keys(prisma);
    console.log("Available models in prisma client:", models.filter(m => !m.startsWith('_') && !m.startsWith('$')));
    
    if ('adDecisionLog' in prisma) {
      console.log("✅ adDecisionLog is available in prisma client.");
    } else {
      console.log("❌ adDecisionLog is MISSING in prisma client.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
