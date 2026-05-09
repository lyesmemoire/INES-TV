"use client"

import React from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import MatchCard from '@/components/home/MatchCard'
import { Channel } from '@/src/types'
import { Trophy, Globe, Tv, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface SEOClusterLayoutProps {
  lang: 'fr' | 'en'
  title: string
  description: string
  matches: Channel[]
  dict: any
}

export default function SEOClusterLayout({ lang, title, description, matches, dict }: SEOClusterLayoutProps) {
  const isFr = lang === 'fr'

  return (
    <main className="bg-black text-white min-h-screen">
      <Navbar lang={lang} />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-16 space-y-4">
           <div className="flex items-center gap-2 text-red-600 font-black uppercase tracking-[0.3em] text-[10px]">
              <Tv size={14} />
              {isFr ? 'GOALA TV Direct' : 'GOALA TV Live'}
           </div>
           <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
             {title}
           </h1>
           <p className="text-zinc-500 max-w-2xl text-lg font-medium">
             {description}
           </p>
        </header>

        <section>
           {matches.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {matches.map(match => (
                   <MatchCard key={match.id} match={match} />
                ))}
             </div>
           ) : (
             <div className="space-y-12">
                {/* Empty State / Thin Content Protection */}
                <div className="bg-zinc-900/50 p-12 md:p-20 rounded-[2.5rem] border border-white/5 text-center">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                      <Tv className="text-zinc-500" size={32} />
                   </div>
                   <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4">
                     {dict.seo.no_matches}
                   </h2>
                   <p className="text-zinc-500 max-w-md mx-auto mb-8">
                     {isFr 
                        ? "Revenez bientôt pour ne rien manquer de l'actualité du foot en direct." 
                        : "Check back soon to never miss any live football action."}
                   </p>
                   <Link 
                     href={`/${lang}`} 
                     className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition shadow-xl shadow-red-600/20"
                   >
                     {dict.seo.back_home}
                   </Link>
                </div>

                {/* SEO Cluster Links (Internal Linking) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                         <Trophy size={16} className="text-yellow-500" />
                         {isFr ? 'Compétitions Populaires' : 'Popular Competitions'}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                         {['Champions League', 'Premier League', 'La Liga', 'Ligue 1'].map(comp => (
                            <Link 
                              key={comp}
                              href={`/${lang}/competition/${comp.toLowerCase().replace(/\s+/g, '-')}`}
                              className="px-4 py-2 bg-black/40 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition flex items-center gap-2"
                            >
                               {comp} <ChevronRight size={10} />
                            </Link>
                         ))}
                      </div>
                   </div>
                   <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                         <Globe size={16} className="text-blue-500" />
                         {isFr ? 'Équipes en Tendance' : 'Trending Teams'}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                         {['Real Madrid', 'PSG', 'Manchester City', 'Barcelona'].map(team => (
                            <Link 
                              key={team}
                              href={`/${lang}/team/${team.toLowerCase().replace(/\s+/g, '-')}`}
                              className="px-4 py-2 bg-black/40 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition flex items-center gap-2"
                            >
                               {team} <ChevronRight size={10} />
                            </Link>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
           )}
         </section>
         <section className="mt-20 pt-20 border-t border-white/5">
           <div className="max-w-4xl">
              <h2 className="text-xl font-bold mb-6 text-zinc-300 uppercase tracking-widest">
                 {isFr ? 'À propos du Streaming Football sur GOALA' : 'About Football Streaming on GOALA'}
              </h2>
              <div className="prose prose-invert prose-zinc max-w-none text-zinc-500 text-sm leading-relaxed space-y-4">
                 <p>
                    {isFr 
                       ? "GOALA TV est votre plateforme de référence pour suivre le football mondial en direct. Que vous cherchiez les matchs de Ligue 1, de Premier League ou de la Ligue des Champions, nous regroupons les meilleures sources pour vous garantir une expérience de streaming fluide et en haute définition."
                       : "GOALA TV is your go-to platform for following world football live. Whether you're looking for Ligue 1, Premier League, or Champions League matches, we aggregate the best sources to guarantee you a smooth, high-definition streaming experience."}
                 </p>
                 <p>
                    {isFr
                       ? "Notre technologie exclusive GOALA Engine analyse en temps réel l'engagement des supporters pour mettre en avant les affiches les plus passionnantes. En plus des scores en direct, accédez aux compositions d'équipes et aux statistiques détaillées pour ne rien manquer de l'actualité du ballon rond."
                       : "Our exclusive GOALA Engine technology analyzes supporter engagement in real-time to highlight the most exciting matches. In addition to live scores, access team lineups and detailed statistics to stay on top of the latest football news."}
                 </p>
              </div>
           </div>
        </section>
      </div>

      <Footer lang={lang} />
    </main>
  )
}
