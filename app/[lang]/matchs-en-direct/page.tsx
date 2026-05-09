import { EditorialService } from '@/src/services/EditorialService'
import { getDictionary } from '@/src/dictionaries/dictionaries'
import SEOClusterLayout from '@/components/seo/SEOClusterLayout'
import { Metadata } from 'next'
import { MatchStatus } from '@prisma/client'

export const revalidate = 15 // Very aggressive for live matches

export async function generateMetadata({ params }: { params: { lang: 'fr' | 'en' } }): Promise<Metadata> {
  const isFr = params.lang === 'fr'
  return {
    title: isFr ? "Matchs de foot en direct streaming | GOALA" : "Football matches live streaming | GOALA",
    description: isFr 
      ? "Regardez les matchs de foot en direct streaming HD sans abonnement. Scores en temps réel de tous les championnats."
      : "Watch football matches live streaming in HD without subscription. Real-time scores from all leagues.",
    alternates: {
      canonical: `/${params.lang}/${isFr ? 'matchs-en-direct' : 'live-matches'}`,
      languages: {
        'fr': '/fr/matchs-en-direct',
        'en': '/en/live-matches'
      }
    }
  }
}

export default async function LiveMatchesPage({ params }: { params: { lang: 'fr' | 'en' } }) {
  const dict = await getDictionary(params.lang)
  const isFr = params.lang === 'fr'

  const matches = await EditorialService.getMatchesByFilter({
    status: [MatchStatus.LIVE],
    take: 30
  })

  return (
    <SEOClusterLayout
      lang={params.lang}
      title={dict.seo.live_title}
      description={isFr 
        ? "Tous les matchs actuellement en cours. Score en direct, temps fort et streaming stable."
        : "All matches currently in play. Live scores, highlights, and stable streaming."}
      matches={matches}
      dict={dict}
    />
  )
}
