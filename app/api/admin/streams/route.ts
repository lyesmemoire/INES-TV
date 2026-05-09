export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 🛠️ API: /api/admin/streams
 * Gestion des flux pour un match spécifique.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId')

  if (!channelId) {
    return NextResponse.json({ error: 'Missing channelId' }, { status: 400 })
  }

  try {
    const streams = await prisma.stream.findMany({
      where: { channelId },
      orderBy: { priority: 'asc' }
    })

    return NextResponse.json({ streams })
  } catch (error) {
    console.error('[API Admin Streams] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { channelId, type, url, priority } = body

    if (!channelId || !type || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const stream = await prisma.stream.create({
      data: {
        channelId,
        type,
        url,
        priority: parseInt(priority) || 1,
        isActive: true,
        status: 'UNKNOWN'
      }
    })

    return NextResponse.json({ stream })
  } catch (error) {
    console.error('[API Admin Streams] Create Error:', error)
    return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing stream ID' }, { status: 400 })
    }

    const stream = await prisma.stream.update({
      where: { id },
      data
    })

    return NextResponse.json({ stream })
  } catch (error) {
    console.error('[API Admin Streams] Update Error:', error)
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing stream ID' }, { status: 400 })
  }

  try {
    await prisma.stream.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Admin Streams] Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 })
  }
}
