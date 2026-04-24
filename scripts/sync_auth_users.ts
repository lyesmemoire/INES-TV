import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function syncUsers() {
  console.log("KEY LOADED:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true
    }
  })

  console.log(`🚀 Syncing ${users.length} users...`)

  for (const user of users) {
    try {
      if (!user.email) {
        console.log(`⚠️ Skipping user ${user.id} (no email)`)
        continue
      }

      const { data, error } = await supabase.auth.admin.createUser({
        id: user.id, // 🔥 ON FORCE LE UUID EXISTANT
        email: user.email,
        email_confirm: true
      })

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️ Already exists: ${user.email}`)
        } else {
          console.error(`❌ Error for ${user.email}:`, error.message)
        }
        continue
      }

      console.log(`✅ Created: ${data.user?.email} with auth_id: ${data.user?.id}`)

    } catch (err) {
      console.error(`🔥 Fatal error for ${user.email}`, err)
    }
  }

  console.log('🎯 Sync complete')
}

syncUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
