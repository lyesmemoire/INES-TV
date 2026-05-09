import { EditorialService } from '@/src/services/EditorialService'
import { getDictionary } from '@/src/dictionaries/dictionaries'
import SEOClusterLayout from '@/components/seo/SEOClusterLayout'
import { Metadata } from 'next'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { lang: 'fr' | 'en', slug: string } }): Promise<Metadata> {
  const isFr = params.lang === 'fr'
  const compName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return {
    title: isFr 
      ? `${compName} en direct streaming HD | GOALA` 
      : `Watch ${compName} Live Stream HD | GOALA`,
    description: isFr 
      ? `Tous les matchs de la ${compName} en direct. Streaming haute qualité, scores et classements sur GOALA TV.`
      : `Every ${compName} match live. High-quality streaming, scores, and standings on GOALA TV.`,
    alternates: {
      canonical: `/${params.lang}/competition/${params.slug}`,
    }
  }
}

export default async function CompetitionPage({ params }: { params: { lang: 'fr' | 'en', slug: string } }) {
  const dict = await getDictionary(params.lang)
  const isFr = params.lang === 'fr'
  const compName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const matches = await EditorialService.getMatchesByFilter({
    competition: params.slug.replace(/-/g, ' '),
    take: 20
  })

  return (
    <SEOClusterLayout
      lang={params.lang}
      title={isFr ? `${compName} Direct` : `${compName} Live`}
      description={isFr 
        ? `Diffusion intégrale de la ${compName} pour les fans du monde entier.`
        : `Full coverage of the ${compName} for fans worldwide.`}
      matches={matches}
      dict={dict}
    />
  )
}
