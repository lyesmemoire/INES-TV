import { EditorialService } from '@/src/services/EditorialService'
import { getDictionary } from '@/src/dictionaries/dictionaries'
import SEOClusterLayout from '@/components/seo/SEOClusterLayout'
import { Metadata } from 'next'

export const revalidate = 30

export async function generateMetadata({ params }: { params: { lang: 'fr' | 'en' } }): Promise<Metadata> {
  const isFr = params.lang === 'fr'
  return {
    title: isFr ? "Matchs de football aujourd’hui en direct | GOALA" : "Live Football Matches Today | GOALA",
    description: isFr 
      ? "Découvrez tous les matchs de foot aujourd'hui en direct streaming HD. Scores en temps réel et liens officiels sur GOALA TV."
      : "Discover all of today's football matches live in HD. Real-time scores and official streaming links on GOALA TV.",
    alternates: {
      canonical: `/${params.lang}/${isFr ? 'football-aujourdhui' : 'football-today'}`,
      languages: {
        'fr': '/fr/football-aujourdhui',
        'en': '/en/football-today'
      }
    }
  }
}

export default async function TodayMatchesPage({ params }: { params: { lang: 'fr' | 'en' } }) {
  const dict = await getDictionary(params.lang)
  const isFr = params.lang === 'fr'

  // Define today's range
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const matches = await EditorialService.getMatchesByFilter({
    dateRange: { start, end },
    take: 30
  })

  return (
    <SEOClusterLayout
      lang={params.lang}
      title={dict.seo.today_title}
      description={isFr 
        ? "Suivez toute l'actualité du ballon rond avec les matchs du jour. Diffusion haute qualité et statistiques en direct."
        : "Follow all the action with today's matches. High-quality broadcasts and live statistics."}
      matches={matches}
      dict={dict}
    />
  )
}
