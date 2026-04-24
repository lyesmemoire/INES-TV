import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function diagnose() {
  console.log('🔍 [DIAGNOSTIC] Channel table status...\n')

  try {
    // Total count
    const total = await prisma.channel.count()
    console.log(`📊 Total channels in DB: ${total}`)

    // Active vs inactive
    const active = await prisma.channel.count({ where: { isActive: true, deletedAt: null } })
    const inactive = await prisma.channel.count({ where: { isActive: false } })
    const deleted = await prisma.channel.count({ where: { deletedAt: { not: null } } })

    console.log(`   ✅ Active (isActive=true, deletedAt=null): ${active}`)
    console.log(`   ⏸️  Inactive (isActive=false): ${inactive}`)
    console.log(`   🗑️  Soft-deleted (deletedAt != null): ${deleted}`)

    if (total > 0) {
      // Sample first 5
      const sample = await prisma.channel.findMany({
        take: 5,
        select: { id: true, name: true, isActive: true, deletedAt: true, status: true, streamUrl: true }
      })
      console.log('\n📋 Sample (first 5):')
      for (const ch of sample) {
        console.log(`   [${ch.isActive ? '✅' : '❌'}] ${ch.name} | status=${ch.status} | url=${ch.streamUrl ? '✔' : '✗'}`)
      }
    }

    // FeaturedMatch count
    const fm = await prisma.featuredMatch.count()
    console.log(`\n🏆 FeaturedMatch rows: ${fm}`)

    // LiveSource count
    const ls = await prisma.liveSource.count()
    console.log(`📡 LiveSource rows: ${ls}`)

    // HouseAd count
    const ha = await prisma.houseAd.count()
    console.log(`💰 HouseAd rows: ${ha}`)

    console.log('\n' + (total === 0
      ? '⚠️  CHANNELS TABLE IS EMPTY — NEED TO RE-IMPORT M3U'
      : active === 0
        ? '⚠️  Channels exist but NONE ACTIVE — check isActive flag or deletedAt'
        : `✅ ${active} channels active and ready`)
    )

  } catch (err: any) {
    console.error('❌ [CRASH] Prisma query failed:')
    console.error(err.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnose()
