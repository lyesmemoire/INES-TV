export type Channel = {
  id: string
  name: string
  logo: string
  category: string
  live?: boolean
  description?: string
  streamUrl?: string
  thumbnail?: string
  homeName?: string
  awayName?: string
  homeLogo?: string
  awayLogo?: string
  score?: string
  league?: string
  matchTime?: string
  status?: 'LIVE' | 'UPCOMING' | 'FINISHED' | 'ENDED'
  slug?: string
}
