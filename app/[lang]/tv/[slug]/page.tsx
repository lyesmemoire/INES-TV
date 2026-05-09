import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FreeChannelService } from '@/src/services/FreeChannelService'
import FTAPlayer from '@/components/FTAPlayer'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: {
    lang: string
    slug: string
  }
}

export const revalidate = 60

// Helper to extract base slug
function getBaseSlug(slug: string) {
  return slug.replace(/-direct$/, '').replace(/-live$/, '')
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const baseSlug = getBaseSlug(params.slug)
  const channel = await FreeChannelService.getBySlug(baseSlug)

  if (!channel) {
    return { title: 'Channel Not Found | GOALA' }
  }

  const isFr = params.lang === 'fr'
  const title = isFr 
    ? `${channel.name} en direct | GOALA` 
    : `${channel.name} Live | GOALA`
    
  const description = isFr
    ? `Regardez ${channel.name} en direct gratuitement. Diffusion officielle et continue sur GOALA.`
    : `Watch ${channel.name} live online. Official free-to-air broadcast on GOALA.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.lang}/tv/${baseSlug}${isFr ? '-direct' : '-live'}`,
      languages: {
        'fr': `/fr/tv/${baseSlug}-direct`,
        'en': `/en/tv/${baseSlug}-live`
      }
    }
  }
}

export default async function FTAPage({ params }: PageProps) {
  const baseSlug = getBaseSlug(params.slug)
  const channel = await FreeChannelService.getBySlug(baseSlug)

  if (!channel) {
    notFound()
  }

  const isFr = params.lang === 'fr'
  const suffix = isFr ? '-direct' : '-live'

  // Generate JSON-LD BroadcastEvent
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BroadcastEvent",
    "name": isFr ? `${channel.name} en direct` : `${channel.name} live`,
    "isLiveBroadcast": true,
    "broadcastOfEvent": {
      "@type": "Event",
      "name": channel.name
    }
  }

  // Fetch related channels from the same country
  const relatedChannels = await prisma.freeChannel.findMany({
    where: { 
      country: channel.country,
      id: { not: channel.id },
      isActive: true
    },
    take: 5
  })

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Monetization Slot (Top) */}
        <div className="w-full h-[90px] bg-white/5 rounded-xl flex items-center justify-center border border-dashed border-white/10 mb-8">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            {isFr ? 'Espace Publicitaire FTA (Top Banner)' : 'FTA Ad Space (Top Banner)'}
          </span>
        </div>

        <header className="flex items-center space-x-4">
          {channel.logo && (
            <img src={channel.logo} alt={channel.name} className="w-16 h-16 rounded-full bg-white/10" />
          )}
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              {channel.name} <span className="text-red-500">{isFr ? 'en direct' : 'Live'}</span>
            </h1>
            <p className="text-gray-400 mt-2 capitalize">{channel.category} • {channel.country}</p>
          </div>
        </header>

        {/* Player Section */}
        <section className="bg-[#111] border border-white/5 rounded-2xl p-4 md:p-8 relative">
          {channel.streams && channel.streams.length > 0 ? (
            <div className="relative">
              {/* Optional: Pre-roll Overlay for M3U8 could go here */}
              <FTAPlayer 
                key={params.slug}
                streams={channel.streams} 
              />
            </div>
          ) : (
            <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
              <p className="text-gray-500">No streams available at the moment.</p>
            </div>
          )}
        </section>

        {/* Monetization Slot (Mid) */}
        <div className="w-full h-[250px] md:h-[90px] bg-white/5 rounded-xl flex items-center justify-center border border-dashed border-white/10 my-8">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            {isFr ? 'Espace Publicitaire FTA (Mid Banner)' : 'FTA Ad Space (Mid Banner)'}
          </span>
        </div>

        {/* Internal Linking / Related Channels */}
        <section className="pt-8 border-t border-white/10">
          <h2 className="text-2xl font-semibold mb-6">
            {isFr ? `Autres chaînes populaires - ${channel.country}` : `More popular channels - ${channel.country}`}
          </h2>
          {relatedChannels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {relatedChannels.map((c) => (
                <Link 
                  key={c.id} 
                  href={`/${params.lang}/tv/${c.slug}${suffix}`}
                  className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors group"
                >
                  <div className="aspect-square bg-black/50 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    ) : (
                      <span className="text-2xl opacity-50">📺</span>
                    )}
                  </div>
                  <h3 className="font-medium text-center truncate">{c.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No related channels found.</p>
          )}
        </section>
      </div>
    </main>
  )
}
