import React from 'react';
import { Metadata } from 'next';
import { Megaphone, Zap, ShieldCheck, Play, Tv, Clock, Share2, Globe } from 'lucide-react';

const TRANSLATIONS: any = {
  en: {
    watch: "Watch",
    liveStreamingFree: "Live Streaming Free",
    noSignup: "No Signup",
    description: "Watch live online for free in Full HD. No registration required.",
    liveNow: "Live Now",
    hdStreaming: "HD Streaming",
    about: "About",
    technology: "Technology",
    primaryServer: "Primary Server",
    backupServer: "Backup Server #2",
    stable1080p: "Stable 1080p"
  },
  fr: {
    watch: "Regarder",
    liveStreamingFree: "Streaming Gratuit",
    noSignup: "Sans Inscription",
    description: "Regardez en direct gratuitement en Full HD. Aucune inscription requise.",
    liveNow: "En Direct",
    hdStreaming: "Streaming HD",
    about: "À propos",
    technology: "Technologie",
    primaryServer: "Serveur Principal",
    backupServer: "Serveur de Secours #2",
    stable1080p: "Stable 1080p"
  },
  es: {
    watch: "Ver",
    liveStreamingFree: "Streaming Gratis",
    noSignup: "Sin Registro",
    description: "Ver en vivo gratis en Full HD. No se requiere registro.",
    liveNow: "En Vivo",
    hdStreaming: "Streaming HD",
    about: "Acerca de",
    technology: "Tecnología",
    primaryServer: "Servidor Principal",
    backupServer: "Servidor de Respaldo #2",
    stable1080p: "Estable 1080p"
  },
  de: {
    watch: "Schauen",
    liveStreamingFree: "Kostenloser Live-Stream",
    noSignup: "Keine Anmeldung",
    description: "Kostenlos online in Full HD schauen. Keine Registrierung erforderlich.",
    liveNow: "Jetzt Live",
    hdStreaming: "HD-Streaming",
    about: "Über",
    technology: "Technologie",
    primaryServer: "Hauptserver",
    backupServer: "Backup-Server #2",
    stable1080p: "Stabiles 1080p"
  }
};

// ─── Dynamic Metadata (SEO Engine Multi-Lang) ────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ lang: string, slug: string }> }): Promise<Metadata> {
  const { lang, slug } = (await params);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const channelName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${t.watch} ${channelName} ${t.liveStreamingFree} - Full HD ${t.noSignup}`,
    description: `${t.watch} ${channelName} ${t.description}`,
    openGraph: {
      title: `${channelName} ${t.liveStreamingFree}`,
      description: `${t.watch} ${channelName} in HD quality.`,
      images: ['/og-image-live.jpg'],
      locale: lang === 'en' ? 'en_US' : lang === 'fr' ? 'fr_FR' : lang === 'es' ? 'es_ES' : 'de_DE'
    }
  };
}

// ─── Multi-Language SEO Landing Page ─────────────────────────────────────────

export default async function GlobalWatchPage({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = (await params);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const channelName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      
      {/* 🚀 Header */}
      <header className="border-b border-white/5 py-4 px-6 bg-[#111827]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-extrabold text-indigo-500 tracking-tighter">
                STREAM<span className="text-white">PERF</span>
            </h1>
            <div className="flex gap-4 items-center">
                <Globe size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-500 uppercase">{lang}</span>
                <div className="h-4 w-[1px] bg-white/10 mx-2" />
                <ShieldCheck className="text-green-500 w-5 h-5" />
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-6">
        
        <div className="grid lg:grid-cols-3 gap-12">
            
            {/* 📺 Player Section */}
            <div className="lg:col-span-2">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/5 relative group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-100 group-hover:bg-black/40 transition-all">
                        <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/50 group-hover:scale-110 transition-transform">
                            <Play className="fill-white text-white ml-1" size={32} />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">{t.liveNow}</span>
                        <span className="text-xs text-gray-500 font-bold ml-4 flex items-center gap-1 uppercase tracking-widest">
                            <Clock size={12} /> {t.hdStreaming}
                        </span>
                    </div>
                    <h2 className="text-4xl font-black mb-4 uppercase italic leading-tight">
                        {t.watch} <span className="text-indigo-500">{channelName}</span> {t.liveStreamingFree}
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-lg">
                        {t.description} {t.watch} <span className="text-white font-bold">{channelName}</span> on your PC, mobile, or tablet with zero latency.
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
                                <p className="font-bold">{t.primaryServer}</p>
                                <p className="text-xs text-green-500 font-bold uppercase tracking-widest">{t.stable1080p}</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl cursor-pointer border border-indigo-500">
                            <Share2 className="text-indigo-500" />
                            <div>
                                <p className="font-bold text-indigo-400">{t.backupServer}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">P2P Ready</p>
                            </div>
                        </li>
                    </ul>

                    {/* Adsterra Sidebar Placeholder */}
                    <div className="mt-8 w-full h-64 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-center text-gray-700 text-xs font-bold text-center px-4 uppercase leading-6">
                        Ad-Yield Optimizer Active ({lang.toUpperCase()})
                    </div>
                </div>
            </div>
        </div>

        {/* 📑 Localized Footer */}
        <div className="mt-20 border-t border-white/5 pt-12 text-gray-500 text-sm leading-8">
            <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs tracking-widest">{t.about} {channelName} {t.technology}</h4>
            <p>
                This {channelName} page in {lang} is part of the INES TV global OTT infrastructure. We provide 100% legal access to public streams and official API integrations. 
                Experience {t.liveStreamingFree} for {channelName} in your language today.
            </p>
        </div>
      </main>
    </div>
  );
}
