import React from 'react';
import { Metadata } from 'next';
import { Zap, ShieldCheck, Play, Tv, Clock, Share2, ArrowLeft, Radio } from 'lucide-react';
import MatchPlayer from '@/src/components/Player/MatchPlayer';
import { PlayerErrorBoundary } from '@/src/components/Player/PlayerErrorBoundary';
import Link from 'next/link';

// ─── Dynamic Metadata (SEO Engine) ───────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const channelName = decodeURIComponent(slug).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `Watch ${channelName} Live - INES TV`,
    description: `Watch ${channelName} live online. HD streaming, no signup required.`,
  };
}

// ─── Fetch channel (resilient) ───────────────────────────────────────────────

async function getChannel(slug: string) {
  try {
    const { prisma } = await import('@/server/services/db');
    const channel = await prisma.channel.findFirst({
      where: {
        OR: [
          { id: slug },
          { name: { contains: slug.replace(/-/g, ' '), mode: 'insensitive' } }
        ],
        isActive: true,
        deletedAt: null
      }
    });
    if (channel) return channel;
  } catch (err) {
    console.warn('[WatchPage] Prisma unavailable, using fallback');
  }

  // Fallback: build a channel from the slug
  return {
    id: slug,
    name: decodeURIComponent(slug).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    category: 'Live',
    streamUrl: null,
    streamSources: null,
  };
}

// ─── Watch Page ──────────────────────────────────────────────────────────────

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  if (!slug || slug === "undefined") {
    return <div className="p-10 text-center text-red-500 font-bold bg-black min-h-screen">Invalid match ID</div>;
  }

  const channel = await getChannel(slug);
  const channelName = channel.name;

  return (
    <div className="min-h-screen bg-[#030303] text-white">

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
              <ArrowLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Back</span>
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Tv size={14} />
              </div>
              <span className="font-black tracking-tight">INES<span className="text-red-500">TV</span></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-500 w-4 h-4" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Encrypted Stream</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 md:px-6">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ─── Player Section ─── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-red-500/5">
              <PlayerErrorBoundary>
                <MatchPlayer matchId={channel.id} />
              </PlayerErrorBoundary>
            </div>

            {/* Match Info */}
            <div className="mt-6 p-6 bg-[#0A0A0A] rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-red-600/10 px-3 py-1.5 rounded-full border border-red-500/20">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Live Now</span>
                </div>
                <span className="text-xs text-zinc-500 font-bold flex items-center gap-1">
                  <Clock size={12} /> HD Streaming
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
                {channelName}
              </h2>

              <p className="text-zinc-400 text-sm leading-relaxed">
                Live stream of <span className="text-white font-bold">{channelName}</span>.
                HD quality with zero-lag playback. No registration required.
              </p>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-6">
            {/* Stream Sources */}
            <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="text-red-500" size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">Stream Sources</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-red-600/5 rounded-xl border border-red-500/20 cursor-pointer hover:bg-red-600/10 transition">
                  <Tv className="text-red-500" size={18} />
                  <div>
                    <p className="font-bold text-sm">Primary Stream</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">● Online • 1080p</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition">
                  <Share2 className="text-zinc-400" size={18} />
                  <div>
                    <p className="font-bold text-sm text-zinc-300">Backup Mirror</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Standby • 720p</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad placeholder */}
            <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-white/5 flex items-center justify-center min-h-[200px]">
              <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.2em]">Ad Zone</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
