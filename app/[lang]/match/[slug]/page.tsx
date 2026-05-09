import { fetchLiveMatches } from '@/src/lib/footballService'
// Cache buster: 1714846440
import { generateMatchMetadata } from '@/lib/seo/generateMetadata'
import { generateMatchStructuredData } from '@/lib/seo/structuredData'
import Script from 'next/script'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Play, Trophy, Info, Share2, TrendingUp, Activity } from 'lucide-react'
import { getDictionary } from '@/src/dictionaries/dictionaries'
import MatchPlayerContainer from '@/components/match/MatchPlayerContainer'
import MatchInteractiveLayer from '@/components/match/MatchInteractiveLayer'
import MatchStatusIndicator from '@/components/match/MatchStatusIndicator'
import { TVCard } from '@/components/TVCard'
import LiveScoreBadge from '@/components/match/LiveScoreBadge'
import ContinueWatchingTracker from '@/components/ContinueWatchingTracker'

import { notFound } from 'next/navigation'
import { EditorialService } from '@/src/services/EditorialService'
import { AdSlot } from '@/components/ads/AdSlot'
import { Channel } from '@/src/types'

function mapMatchToChannel(m: any): Channel {
  return {
    id: m.id,
    name: `${m.homeTeam} vs ${m.awayTeam}`,
    category: m.league,
    viewers: 0,
    logo: '/fallback-logo.png', // Fallback for TVCard
    slug: m.slug,
    live: m.status === 'LIVE' || m.status === 'IN_PLAY',
    status: m.status,
    scheduledAt: m.scheduledAt,
    streamUrl: m.streamUrl
  } as Channel;
}

export async function generateMetadata({ params }: { params: { slug: string, lang: 'fr' | 'en' } }) {
  const match = await EditorialService.getMatchBySlug(params.slug)
  const isFr = params.lang === 'fr'
  
  if (!match) {
    return { title: isFr ? 'Événement Non Trouvé' : 'Event Not Found' }
  }

  // Stable title: Only include score if status is LIVE or FINISHED
  // Avoid changing title for every goal if possible (but user asked for it in examples)
  // We'll follow the "only if status change" guideline for high stability
  let title = `${match.homeTeam} vs ${match.awayTeam}`
  if (match.status === 'LIVE') {
    title = `🔴 ${isFr ? 'DIRECT' : 'LIVE'}: ${match.homeTeam} vs ${match.awayTeam}`
  } else if (match.status === 'FINISHED') {
    title = `${match.homeTeam} ${match.score} ${match.awayTeam} - ${isFr ? 'Terminé' : 'Finished'}`
  } else {
    title = `${match.homeTeam} vs ${match.awayTeam} - Streaming ${isFr ? 'en direct' : 'Live'}`
  }

  return {
    title: `${title} | GOALA`,
    description: isFr 
      ? `Regardez ${match.homeTeam} vs ${match.awayTeam} en direct streaming. Match de ${match.league} en HD sur GOALA TV.`
      : `Watch ${match.homeTeam} vs ${match.awayTeam} live streaming. ${match.league} match in HD on GOALA TV.`,
    alternates: {
      canonical: `/${params.lang}/match/${params.slug}`,
      languages: {
        'fr': `/fr/match/${params.slug}`,
        'en': `/en/match/${params.slug}`,
      }
    },
    other: {
      'preconnect': 'https://stream-domain.com'
    }
  }
}

export default async function MatchPage({ params }: { params: { slug: string, lang: 'fr' | 'en' } }) {
  const data = await fetchLiveMatches()
  const dict = await getDictionary(params.lang)
  const match = data.matches.find(m => m.slug === params.slug)

  if (!match) {
    notFound()
  }

  const structuredData = generateMatchStructuredData(match)

  // Deterministic Social Proof
  const hash = match.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = 1500;
  const variance = hash % 4000;
  let viewersCount = base + variance;
  if (match.status === 'LIVE' || match.status === 'IN_PLAY') viewersCount = Math.floor(viewersCount * 1.3);
  const formattedViewers = viewersCount.toLocaleString();
  const isTrending = viewersCount > 4000;

  // Related Matches
  const relatedMatches = data.matches
    .filter(m => m.id !== match.id && (m.league === match.league || m.status === 'LIVE'))
    .slice(0, 3);

  const channelMatch = mapMatchToChannel(match);
  const allChannels = data.matches.map(mapMatchToChannel);

  return (
    <main className="bg-black text-white min-h-screen selection:bg-red-600 relative">
      <MatchInteractiveLayer match={channelMatch} allMatches={allChannels} isFr={params.lang === 'fr'}>
        {(openModal) => (
          <>
            <Navbar lang={params.lang} />
      
      <ContinueWatchingTracker 
        slug={match.slug} 
        homeTeam={match.homeTeam} 
        awayTeam={match.awayTeam} 
      />
      
      <Script
        id="match-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        
        {/* SEO Header */}
        <div className="mb-12 space-y-4">
          <div className="mb-8">
            <AdSlot placement="header" className="max-w-4xl mx-auto" />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <MatchStatusIndicator status={match.status || 'UNKNOWN'} scheduledAt={match.scheduledAt} isFr={params.lang === 'fr'} />
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {match.league}
              </span>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-1 bg-emerald-500 rounded-full" />
               {dict.common.last_updated}: {new Date().toISOString().split('T')[1].slice(0, 5)} UTC
            </div>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
            {params.lang === 'fr' ? 'Regarder' : 'Watch'} {match.homeTeam} <span className="text-red-600">vs</span> {match.awayTeam} <br />
            <span className="text-zinc-500">{params.lang === 'fr' ? 'Streaming en Direct' : 'Live Stream Online'}</span>
          </h1>

          {/* Social Proof Strategy */}
          <div className="flex items-center gap-3 text-sm mt-4">
             <span className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                {formattedViewers} {params.lang === 'fr' ? 'spectateurs' : 'watching now'}
             </span>
             {isTrending && (
                <span className="text-red-500 font-black uppercase tracking-widest text-[10px] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  🔥 Trending {match.league} Match
                </span>
             )}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <a 
              href={`/${params.lang}/competition/${match.league.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition"
            >
               <Trophy size={14} className="text-yellow-500" />
               {match.league} {dict.common.live}
            </a>
            <a 
              href={`/${params.lang}/team/${match.homeTeam.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition"
            >
               {dict.common.more_from} {match.homeTeam}
            </a>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">
               <Info size={14} />
               {dict.common.hd_quality}
            </div>
          </div>
        </div>

        {/* Player Section */}
        <MatchPlayerContainer 
          lang={params.lang}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          onPlay={openModal}
        />

        {/* SEO Content Section */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/5 pt-12">
           <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{dict.match.preview}</h2>
                <p className="text-zinc-400 leading-relaxed">
                  {params.lang === 'fr' 
                    ? `Le choc à venir entre ${match.homeTeam} et ${match.awayTeam} est l'une des affiches les plus attendues de la ${match.league}.`
                    : `The upcoming clash between ${match.homeTeam} and ${match.awayTeam} is one of the most anticipated fixtures in the ${match.league}.`}
                </p>
                <p className="text-zinc-400 leading-relaxed mt-4">
                  {dict.common.platform_tag}
                </p>
              </section>

              <AdSlot placement="in-content" className="my-8" />

              {/* 📊 Head to Head (SEO Signal) */}
              <section className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <TrendingUp size={24} className="text-red-600" />
                  Stats H2H
                </h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col p-4 bg-black/40 rounded-2xl">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{match.homeTeam}</span>
                    <span className="text-2xl font-black italic tracking-tighter">12</span>
                  </div>
                  <div className="flex flex-col p-4 bg-black/40 rounded-2xl">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Draws</span>
                    <span className="text-2xl font-black italic tracking-tighter">8</span>
                  </div>
                  <div className="flex flex-col p-4 bg-black/40 rounded-2xl">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{match.awayTeam}</span>
                    <span className="text-2xl font-black italic tracking-tighter">10</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{dict.match.how_to_watch}</h2>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  {dict.common.no_subscription}
                </p>
              </section>
           </div>

           <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 h-fit">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">{dict.match.details}</h3>
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block mb-1">Competition</span>
                  <span className="text-sm font-bold">{match.league}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block mb-1">Status</span>
                  <MatchStatusIndicator status={match.status || 'UNKNOWN'} scheduledAt={match.scheduledAt} isFr={params.lang === 'fr'} />
                </div>
              </div>
              <div className="mt-8">
                <AdSlot placement="sidebar" />
              </div>
           </div>
        </div>

         {/* 🔗 Internal Cluster Linking (SEO Strength) */}
         <div className="mt-12 p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">
              {params.lang === 'fr' ? 'Explorer plus de clusters' : 'Explore more clusters'}
            </h3>
            <div className="flex flex-wrap gap-4">
               <a href={`/${params.lang}/live-football-now`} className="text-xs font-bold text-red-600 hover:underline">
                 → {dict.common.all_matches}
               </a>
               <a href={`/${params.lang}/competition/${match.league.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs font-bold text-zinc-400 hover:text-white transition">
                 → {match.league}
               </a>
            </div>
         </div>

          {/* Related Matches */}
          {relatedMatches.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-white">
                🔥 {params.lang === 'fr' ? `Plus de ${match.league}` : `More From ${match.league}`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedMatches.map((related, index) => (
                  <TVCard key={related.id} channel={mapMatchToChannel(related)} lang={params.lang} priority={index === 0} />
                ))}
              </div>
            </div>
          )}

      </div>

      <Footer lang={params.lang} />
          </>
        )}
      </MatchInteractiveLayer>
    </main>
  )
}
