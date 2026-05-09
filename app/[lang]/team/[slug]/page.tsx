import { EditorialService } from '@/src/services/EditorialService'
import { getDictionary } from '@/src/dictionaries/dictionaries'
import SEOClusterLayout from '@/components/seo/SEOClusterLayout'
import { Metadata } from 'next'

export const revalidate = 300 // Teams update less frequently

export async function generateMetadata({ params }: { params: { lang: 'fr' | 'en', slug: string } }): Promise<Metadata> {
  const isFr = params.lang === 'fr'
  const teamName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return {
    title: isFr 
      ? `Regarder ${teamName} en direct streaming | GOALA` 
      : `Watch ${teamName} Live Stream Today | GOALA`,
    description: isFr 
      ? `Suivez tous les matchs du ${teamName} en direct HD. Scores, calendrier et streaming gratuit sur GOALA TV.`
      : `Follow all ${teamName} matches live in HD. Scores, schedule and free streaming on GOALA TV.`,
    alternates: {
      canonical: `/${params.lang}/team/${params.slug}`,
    }
  }
}

export default async function TeamPage({ params }: { params: { lang: 'fr' | 'en', slug: string } }) {
  const dict = await getDictionary(params.lang)
  const isFr = params.lang === 'fr'
  const teamName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const matches = await EditorialService.getMatchesByFilter({
    team: params.slug.replace(/-/g, ' '),
    take: 20
  })

  return (
    <SEOClusterLayout
      lang={params.lang}
      title={isFr ? `Hub ${teamName}` : `${teamName} Hub`}
      description={isFr 
        ? `Tout le contenu streaming et les infos en direct pour le ${teamName}.`
        : `All streaming content and live info for ${teamName}.`}
      matches={matches}
      dict={dict}
    />
  )
}
