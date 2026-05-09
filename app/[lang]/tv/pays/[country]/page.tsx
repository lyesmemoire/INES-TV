import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    lang: string
    country: string
  }
}

export const revalidate = 60

const countryNames: Record<string, { fr: string; en: string }> = {
  fr: { fr: "France", en: "France" },
  ma: { fr: "Maroc", en: "Morocco" },
  dz: { fr: "Algérie", en: "Algeria" },
  tn: { fr: "Tunisie", en: "Tunisia" },
  eg: { fr: "Égypte", en: "Egypt" },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const countryCode = params.country.toLowerCase()
  const countryNameObj = countryNames[countryCode]
  const isFr = params.lang === 'fr'
  
  if (!countryNameObj) {
    return { title: 'Channels | GOALA' }
  }

  const title = isFr
    ? `Chaînes TV ${countryNameObj.fr} en direct | GOALA`
    : `Live TV Channels from ${countryNameObj.en} | GOALA`
    
  const description = isFr
    ? `Regardez toutes les chaînes gratuites de ${countryNameObj.fr} en direct et en streaming haute qualité sur GOALA.`
    : `Watch all free live TV channels from ${countryNameObj.en} in high quality streaming on GOALA.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.lang}/tv/pays/${params.country}`,
      languages: {
        'fr': `/fr/tv/pays/${params.country}`,
        'en': `/en/tv/pays/${params.country}`
      }
    }
  }
}

export default async function CountryChannelsPage({ params }: PageProps) {
  const countryCode = params.country.toUpperCase()
  const countryNameObj = countryNames[params.country.toLowerCase()]
  const isFr = params.lang === 'fr'

  if (!countryNameObj) {
    notFound()
  }

  const channels = await prisma.freeChannel.findMany({
    where: { 
      country: countryCode, 
      isActive: true 
    },
    orderBy: { name: "asc" }
  })

  const countryName = isFr ? countryNameObj.fr : countryNameObj.en
  const suffix = isFr ? '-direct' : '-live'

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {isFr ? `Chaînes TV en direct - ${countryName}` : `Live TV Channels - ${countryName}`}
          </h1>
          <p className="text-xl text-gray-400">
            {isFr 
              ? `Accédez aux meilleures chaînes d'information, de divertissement et de sport de ${countryName}.`
              : `Access the best news, entertainment, and sports channels from ${countryName}.`}
          </p>
        </header>

        {channels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {channels.map(c => (
              <Link 
                key={c.id} 
                href={`/${params.lang}/tv/${c.slug}${suffix}`}
                className="group flex flex-col bg-[#111] border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all hover:bg-[#1a1a1a]"
              >
                <div className="aspect-square bg-black/50 rounded-xl mb-4 flex items-center justify-center p-4">
                  {c.logo ? (
                    <img src={c.logo} alt={c.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-4xl opacity-40">📺</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold truncate text-center group-hover:text-red-500 transition-colors">
                  {c.name}
                </h3>
                <span className="text-xs text-gray-500 text-center uppercase tracking-wider mt-2">
                  {c.category}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <span className="text-6xl mb-6 block opacity-20">📡</span>
            <h2 className="text-2xl font-bold mb-2">
              {isFr ? "Aucune chaîne disponible" : "No channels available"}
            </h2>
            <p className="text-gray-500">
              {isFr 
                ? `Il n'y a pas encore de chaînes configurées pour ${countryName}.`
                : `There are no channels configured for ${countryName} yet.`}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
