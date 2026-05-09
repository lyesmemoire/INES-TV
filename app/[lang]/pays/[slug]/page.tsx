import { EditorialService } from '@/src/services/EditorialService'
import { getDictionary } from '@/src/dictionaries/dictionaries'
import SEOClusterLayout from '@/components/seo/SEOClusterLayout'
import { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { lang: 'fr' | 'en', slug: string } }): Promise<Metadata> {
  const isFr = params.lang === 'fr'
  const countryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)
  
  return {
    title: isFr 
      ? `Matchs de foot ${countryName} en direct | GOALA` 
      : `Live ${countryName} Football Matches | GOALA`,
    description: isFr 
      ? `Regardez tous les matchs de foot de ${countryName} en direct streaming HD. Championnats nationaux et coupes en direct.`
      : `Watch all ${countryName} football matches live in HD. National leagues and cups coverage.`,
    alternates: {
      canonical: `/${params.lang}/pays/${params.slug}`,
    }
  }
}

export default async function CountryMatchesPage({ params }: { params: { lang: 'fr' | 'en', slug: string } }) {
  const dict = await getDictionary(params.lang)
  const isFr = params.lang === 'fr'
  const countryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)

  // Map slug to potential competition keywords (simplified for Phase 2)
  const countryToComp: Record<string, string> = {
    'algerie': 'Ligue 1 Mobilis',
    'maroc': 'Botola',
    'tunisie': 'Ligue Professionnelle',
    'france': 'Ligue 1',
    'espagne': 'La Liga',
    'angleterre': 'Premier League'
  }

  const competition = countryToComp[params.slug.toLowerCase()]

  const matches = await EditorialService.getMatchesByFilter({
    competition: competition || undefined,
    take: 20
  })

  return (
    <SEOClusterLayout
      lang={params.lang}
      title={isFr ? `Matchs ${countryName}` : `${countryName} Matches`}
      description={isFr 
        ? `Retrouvez le meilleur du football de ${countryName} en direct streaming.`
        : `Experience the best of ${countryName} football live streaming.`}
      matches={matches}
      dict={dict}
    />
  )
}
