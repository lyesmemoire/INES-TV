import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    // 1. Memory Metrics
    const memory = process.memoryUsage()
    
    // 2. System Info
    const uptime = process.uptime()
    
    // 3. Prisma Connection Health & Stats
    const dbHealth = await prisma.$queryRaw`SELECT 1`.then(() => 'UP').catch(() => 'DOWN')
    const liveMatchCount = await prisma.match.count({ where: { status: 'LIVE' } })

    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      runtime: {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        memory: {
          rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(memory.external / 1024 / 1024)} MB`,
        }
      },
      database: {
        status: dbHealth,
        liveMatches: liveMatchCount
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'ERROR', 
      message: error.message 
    }, { status: 500 })
  }
}
