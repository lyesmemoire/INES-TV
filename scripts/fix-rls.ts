import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🛡️  Applying RLS fixes to "Channel" table...')
  
  try {
    // 0. Grant usage on schema public to anon and authenticated
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon, authenticated;`)
    await prisma.$executeRawUnsafe(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;`)
    console.log('✅ Schema permissions granted')

    // 1. Enable RLS
    await prisma.$executeRawUnsafe(`ALTER TABLE public."Channel" ENABLE ROW LEVEL SECURITY;`)
    console.log('✅ RLS Enabled')

    // 2. Drop existing policies
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "public_read_Channel" ON public."Channel";`)
    
    // 3. Create new policy for public read (anon and authenticated)
    await prisma.$executeRawUnsafe(`CREATE POLICY "public_read_Channel" ON public."Channel" FOR SELECT TO anon, authenticated USING (true);`)
    console.log('✅ Public read policy created (anon + authenticated)')

    // 4. Verify
    const policies = await prisma.$queryRawUnsafe(`SELECT policyname FROM pg_policies WHERE tablename = 'Channel';`)
    console.log('📊 Current policies:', policies)

  } catch (e) {
    console.error('❌ Failed to apply RLS fixes:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
