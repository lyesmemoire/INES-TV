import HomeClient from '@/components/home/HomeClient'

export const revalidate = 30

export default function Home({ params }: { params: { lang: 'fr' | 'en' } }) {
  return <HomeClient />
}
