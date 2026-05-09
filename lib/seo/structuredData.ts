export function generateMatchStructuredData(match: any) {
  const sportsEvent = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${match.homeTeam} vs ${match.awayTeam}`,
    "description": `Live stream of ${match.homeTeam} vs ${match.awayTeam} in ${match.league}`,
    "startDate": match.scheduledAt || new Date().toISOString(),
    "eventStatus": match.status === 'LIVE' 
      ? "https://schema.org/EventLive" 
      : (match.status === 'FINISHED' ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled"),
    "competitor": [
      {
        "@type": "SportsTeam",
        "name": match.homeTeam
      },
      {
        "@type": "SportsTeam",
        "name": match.awayTeam
      }
    ],
    "location": {
      "@type": "Place",
      "name": "Live Online - GOALA TV",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Global",
        "addressCountry": "WW"
      }
    },
    "offers": {
      "@type": "Offer",
      "url": `https://goala.tv/match/${match.slug}`,
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://goala.tv"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": match.league,
        "item": `https://goala.tv/competition/${match.league.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${match.homeTeam} vs ${match.awayTeam}`,
        "item": `https://goala.tv/match/${match.slug}`
      }
    ]
  };

  return [sportsEvent, breadcrumbs];
}
