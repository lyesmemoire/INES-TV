import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🛡️  Applying GLOBAL RLS fixes to ALL tables in public schema...')
  
  try {
    // 0. Grant usage on schema public to anon and authenticated
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon, authenticated;`)
    await prisma.$executeRawUnsafe(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;`)
    console.log('✅ Schema permissions granted')

    // Get all tables in public schema
    const tables: any[] = await prisma.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`)
    
    for (const { tablename } of tables) {
        console.log(`  Fixing table: ${tablename}`)
        await prisma.$executeRawUnsafe(`ALTER TABLE public."${tablename}" ENABLE ROW LEVEL SECURITY;`)
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "global_read_policy" ON public."${tablename}";`)
        await prisma.$executeRawUnsafe(`CREATE POLICY "global_read_policy" ON public."${tablename}" FOR SELECT TO anon, authenticated USING (true);`)
    }

    console.log('✅ Global read policy created for all tables')

  } catch (e) {
    console.error('❌ Failed to apply global RLS fixes:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
