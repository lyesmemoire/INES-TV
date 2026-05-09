import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

/**
 * 🌱 PRISMA SEED — INES TVduction Baseline
 * Seeds the minimum data required for FeedOrchestrator to stop
 * serving mocked fallbacks and use real DB rows instead.
 * 
 * Safe to run multiple times (upsert pattern).
 */
async function main() {
  console.log('🌱 Starting seed...')

  // =========================================
  // 1. Pick a real channel to pin as Hero
  // =========================================
  const firstChannel = await prisma.channel.findFirst({
    where: { isActive: true, deletedAt: null }
  })

  if (!firstChannel) {
    console.warn('⚠️  No active channel found. Seed FeaturedMatch skipped.')
    console.warn('   → Run your channel sync first, then re-seed.')
  } else {
    // =========================================
    // 2. Pin the channel as Editorial Hero (slot 0)
    // =========================================
    const featured = await prisma.featuredMatch.upsert({
      where: { channelId: firstChannel.id },
      update: { position: 0 },
      create: { channelId: firstChannel.id, position: 0 }
    })
    console.log(`✅ FeaturedMatch → "${firstChannel.name}" (position 0)`)

    // =========================================
    // 3. Add a LiveSource for the channel
    // =========================================
    const existingLiveSource = await prisma.liveSource.findFirst({
      where: { channelId: firstChannel.id, isActive: true }
    })

    if (!existingLiveSource) {
      await prisma.liveSource.create({
        data: {
          channelId: firstChannel.id,
          type: 'M3U',
          url: firstChannel.streamUrl || 'https://example.com/demo.m3u8',
          priority: 100,
          healthScore: 1.0,
          isActive: true
        }
      })
      console.log(`✅ LiveSource → Created for "${firstChannel.name}"`)
    } else {
      console.log(`⚠️  LiveSource already exists for "${firstChannel.name}"`)
    }
  }

  // =========================================
  // 4. House Ad (fallback ad for Sacred Mode)
  // =========================================
  const houseAd = await prisma.houseAd.findFirst({ where: { isActive: true } })
  if (!houseAd) {
    await prisma.houseAd.create({
      data: {
        name: 'INES TV Brand',
        creativeUrl: '/ads/branding_pulse.mp4',
        priority: 999,
        isActive: true,
        minPressure: 0.85,
        maxPressure: 1.0
      }
    })
    console.log('✅ HouseAd → Created default brand house ad')
  } else {
    console.log(`⚠️  HouseAd already exists (${houseAd.name})`)
  }

  console.log('🎯 Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
