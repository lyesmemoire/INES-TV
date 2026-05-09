'use client'

import { useEffect } from 'react'

/**
 * 🛰️ ContinueWatchingTracker
 * Enregistre discrètement le dernier match visité dans le localStorage.
 * Utilisé pour la personnalisation de la Home Page.
 */
export default function ContinueWatchingTracker({
  slug,
  homeTeam,
  awayTeam
}: {
  slug: string
  homeTeam: string
  awayTeam: string
}) {
  useEffect(() => {
    const data = {
      slug,
      homeTeam,
      awayTeam,
      timestamp: Date.now()
    }

    // Stockage sous la nouvelle marque GOALA
    localStorage.setItem('goala_last_match', JSON.stringify(data))
  }, [slug, homeTeam, awayTeam])

  return null
}
