import React from 'react';
import { Metadata } from 'next';
import { prisma } from '@/server/services/db';
import { Megaphone, Zap, ShieldCheck, Play, Tv, Clock, Share2 } from 'lucide-react';
import MatchPlayer from '@/src/components/Player/MatchPlayer';
import { notFound } from 'next/navigation';

// ─── Dynamic Metadata (SEO Engine) ───────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const channelName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `Watch ${channelName} Live Streaming Free - Full HD No Signup`,
    description: `Watch ${channelName} live online for free. Streaming in High Definition (HD). No registration, no credit card, no signup required. Stream live sport and TV now.`,
    keywords: [`${channelName} live`, 'free iptv', 'hd streaming', 'no signup streaming', 'watch sports online', 'live match today'],
    openGraph: {
      title: `${channelName} Live Stream Free`,
      description: `Watch ${channelName} in HD quality without subscription. Free access for all users.`,
      images: ['/og-image-live.jpg'],
      type: 'video.movie'
    }
  };
}

// ─── SEO Landing Page Component ──────────────────────────────────────────────

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  
  // 🔍 Fetch Channel for distribution tracking
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

  if (!channel) notFound();

  const channelName = channel.name;

  // 📹 JSON-LD Video Schema (Phase 20)
  // Ensures Google shows the "PLAY" button and Video snippet in search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `Watch ${channelName} Live Stream`,
    "description": `Free live HD streaming of ${channelName}. No signup required.`,
    "thumbnailUrl": [
      `https://streamperf-pro.com/api/og?title=${encodeURIComponent(channelName)}`
    ],
    "uploadDate": new Date().toISOString(),
    "duration": "PT2H30M", // Average match duration
    "contentUrl": `https://streamperf-pro.com/watch/${slug}`,
    "embedUrl": `https://streamperf-pro.com/watch/${slug}`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": 15420
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      
      {/* 📹 JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 🚀 Header */}
      <header className="border-b border-white/5 py-4 px-6 bg-[#111827]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-extrabold text-indigo-500 tracking-tighter">
                STREAM<span className="text-white">PERF</span>
            </h1>
            <div className="flex gap-4">
                <ShieldCheck className="text-green-500 w-5 h-5" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Encrypted Stream</span>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6">
        
        {/* Adsterra Top Banner (Placeholder) */}
        <div className="w-full h-24 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mb-8 flex items-center justify-center text-gray-600 text-xs font-bold uppercase tracking-widest">
            Advertisements Performance Channel
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
            
            {/* 📺 Player Section */}
            <div className="lg:col-span-2">
                <div className="shadow-2xl shadow-indigo-500/10 border border-white/5 rounded-[32px] overflow-hidden">
                    <MatchPlayer channelId={channel.id} fallbackM3U={channel.streamUrl || ""} />
                </div>

                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">Live Now</span>
                        <span className="text-xs text-gray-500 font-bold ml-4 flex items-center gap-1">
                            <Clock size={12} /> HD STREAMING
                        </span>
                    </div>
                    <h2 className="text-4xl font-black mb-4 uppercase italic leading-tight">
                        Watch <span className="text-indigo-500">{channelName}</span> Live Online Free
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-lg">
                        Welcome to the official StreamPerf portal for <span className="text-white font-bold">{channelName}</span> live streaming. 
                        Experience zero-lag, Full HD quality with no subscription fees. Our global CDN network ensures a smooth playback experience on desktop, mobile, and tablet. 
                        No registration or login required to access the live feed.
                    </p>
                </div>
            </div>

            {/* 📈 Sidebar / Ads & Info */}
            <div>
                <div className="bg-[#111827] rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="text-indigo-400" />
                        <h3 className="font-black text-xl">High Speed Link</h3>
                    </div>
                    
                    <ul className="space-y-4">
                        <li className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-indigo-500/30">
                            <Tv className="text-indigo-500" />
                            <div>
                                <p className="font-bold">Primary Stream #1</p>
                                <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Stable 1080p</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl cursor-pointer border border-indigo-500">
                            <Share2 className="text-indigo-500" />
                            <div>
                                <p className="font-bold text-indigo-400">P2P Mirror #2</p>
                                <p className="text-xs text-gray-500">No Buffering Mode</p>
                            </div>
                        </li>
                    </ul>

                    {/* Adsterra Sidebar Banner (Placeholder) */}
                    <div className="mt-8 w-full h-64 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-center text-gray-700 text-xs font-bold text-center px-4 uppercase leading-6">
                        Promoted Content <br/> Revenue Optimizer
                    </div>
                </div>
            </div>
        </div>

        {/* 📑 SEO Footer Text */}
        <div className="mt-20 border-t border-white/5 pt-12 text-gray-500 text-sm leading-8">
            <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs tracking-widest">About {channelName} Live Stream Technology</h4>
            <p>
                This {channelName} page is part of the StreamPerf global OTT infrastructure. We provide 100% legal access to public streams and official API integrations. 
                Streaming {channelName} live has never been easier. No signup, no login, and no payment required. Watch {channelName} on your PC, iPhone, Android, or Smart TV. 
                All streams are optimized for low bandwidth high quality output. {channelName} Full HD free live streaming link. No account, no subscription, no wait.
            </p>
        </div>
      </main>
    </div>
  );
}
