import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;');
  await prisma.$executeRawUnsafe('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
  await prisma.$executeRawUnsafe('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;');
  
  // also specifically grant on Channel
  await prisma.$executeRawUnsafe('GRANT SELECT, INSERT, UPDATE, DELETE ON "Channel" TO anon, authenticated, service_role;');
  console.log('Permissions fixed');
}

fix().finally(() => prisma.$disconnect());
