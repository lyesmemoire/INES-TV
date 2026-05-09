import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.1.0',
    env: process.env.NODE_ENV
  }, { status: 200 });
}
