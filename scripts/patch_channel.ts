import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function patchSchema() {
  console.log('🔧 [PATCH] Dropping Tenant_slug_key constraint to allow Prisma Push...')
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Tenant" DROP CONSTRAINT IF EXISTS "Tenant_slug_key" CASCADE;`)
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Tenant_slug_key" CASCADE;`)
    console.log('✅ Constraint dropped.')
  } catch(e: any) {
    console.error('❌ SQL Error:', e.message)
  }
}

patchSchema().finally(() => prisma.$disconnect())
