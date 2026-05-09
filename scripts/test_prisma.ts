import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing Prisma connection...");
    const channelCount = await prisma.channel.count();
    console.log("Channel count:", channelCount);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
