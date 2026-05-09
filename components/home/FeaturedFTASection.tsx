import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface FeaturedFTASectionProps {
  lang: 'fr' | 'en'
}

export default async function FeaturedFTASection({ lang }: FeaturedFTASectionProps) {
  const featuredChannels = await prisma.freeChannel.findMany({
    where: { isFeatured: true, isActive: true },
    orderBy: { featuredOrder: 'asc' },
    take: 10
  })

  if (!featuredChannels.length) return null

  const isFr = lang === 'fr'
  const title = isFr ? "Chaînes TV en direct" : "Live TV Channels"
  const suffix = isFr ? '-direct' : '-live'

  return (
    <section className="bg-black py-16 border-t border-white/5 relative z-10">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              {title}
            </h2>
            <p className="text-gray-400 mt-2 text-sm md:text-base font-medium">
              {isFr ? "Regardez vos chaînes préférées gratuitement" : "Watch your favorite channels for free"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {featuredChannels.map((channel) => (
            <Link 
              key={channel.id} 
              href={`/${lang}/tv/${channel.slug}${suffix}`}
              className="group relative rounded-2xl bg-[#111] border border-white/10 hover:border-red-500/50 p-6 flex flex-col items-center justify-center transition-all hover:bg-[#1a1a1a] hover:scale-[1.02]"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-black/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {channel.logo ? (
                  <img src={channel.logo} alt={channel.name} className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <span className="text-3xl">📺</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-center group-hover:text-red-500 transition-colors">
                {channel.name}
              </h3>
              <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                {channel.category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
