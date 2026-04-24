
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  try {
    const res = await prisma.$queryRawUnsafe('SELECT id, email FROM auth.users LIMIT 5');
    console.log('Auth check success:', res);
  } catch (e) {
    console.error('Auth error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
