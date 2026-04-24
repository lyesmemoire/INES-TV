import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAlignment() {
  try {
    const results = await prisma.$queryRawUnsafe(`
      SELECT 
        u.email,
        u.id AS public_id,
        a.id AS auth_id
      FROM "User" u
      LEFT JOIN auth.users a 
        ON u.email = a.email;
    `);
    
    console.log("=== ALIGNMENT REPORT ===");
    console.table(results);
    
  } catch (e: any) {
    console.error('SQL ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlignment();
