
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  try {
    const users: any[] = await prisma.$queryRaw`SELECT id FROM "User" LIMIT 1`;
    if (users.length > 0) {
      console.log('Sample User ID:', users[0].id);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(users[0].id);
      console.log('Is UUID:', isUuid);
    } else {
      console.log('No users found');
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
