/**
 * EPG (Electronic Program Guide) data for all channels
 * Data sourced from epg.pw — Updated 2026-04-29
 */

export type EPGEntry = {
  title: string
  desc: string | null
  start_date: string
  end_date?: string
}

export type ChannelEPG = {
  channel_id: string
  channel_name: string
  country: string
  icon: string
  info_url: string
  epg_list: EPGEntry[]
}

function computeEndDates(entries: EPGEntry[]): EPGEntry[] {
  return entries.map((entry, i) => ({
    ...entry,
    end_date: i < entries.length - 1
      ? entries[i + 1].start_date
      : new Date(new Date(entry.start_date).getTime() + 2 * 3600000).toISOString()
  }))
}

export const epgData: ChannelEPG[] = [
  // ── BEIN SPORTS 1 ────────────────────────────
  {
    channel_id: "beinsport1",
    channel_name: "beIN Sports 1",
    country: "Russian Federation",
    icon: "https://epg.pw/media/images/epg/2026/03/25/20260325030013111985_84.png",
    info_url: "https://epg.pw/channels/532981/20260429.html",
    epg_list: computeEndDates([
      { title: "World Cup 2026 Amazing Facts – The Stars (#14)", desc: null, start_date: "2026-04-29T00:00:00+00:00" },
      { title: "⋗ Cruzeiro (BRA) vs Boca Juniors (ARG) – Copa Libertadores 2026", desc: null, start_date: "2026-04-29T00:20:00+00:00" },
      { title: "Paris Saint-Germain vs Bayern München", desc: null, start_date: "2026-04-29T02:30:00+00:00" },
      { title: "Monterrey – Stories From the City", desc: null, start_date: "2026-04-29T03:00:00+00:00" },
      { title: "Ligue 1 Weekly Review – 2025/26", desc: null, start_date: "2026-04-29T03:30:00+00:00" },
      { title: "EPL Review – 2025/26", desc: null, start_date: "2026-04-29T04:00:00+00:00" },
      { title: "Paris Saint-Germain vs Bayern München", desc: null, start_date: "2026-04-29T05:00:00+00:00" },
      { title: "Arsenal vs Sporting CP – UEFA Champions League 2025/26", desc: null, start_date: "2026-04-29T05:30:00+00:00" },
      { title: "NBA Action 2025/26", desc: null, start_date: "2026-04-29T06:00:00+00:00" },
      { title: "La Liga Highlights 2025/26", desc: null, start_date: "2026-04-29T06:30:00+00:00" },
      { title: "UEL/UECL Magazine 2025/26", desc: null, start_date: "2026-04-29T07:00:00+00:00" },
      { title: "Paris Saint-Germain vs Bayern München", desc: null, start_date: "2026-04-29T08:00:00+00:00" },
      { title: "Manchester United vs Brentford – EPL Week 34", desc: null, start_date: "2026-04-29T11:45:00+00:00" },
      { title: "Chelsea vs Leeds – Emirates FA Cup 2025", desc: null, start_date: "2026-04-29T12:15:00+00:00" },
      { title: "Atlético de Madrid vs Barcelona – UCL 2025/26", desc: null, start_date: "2026-04-29T12:45:00+00:00" },
      { title: "UEL/UECL Magazine 2025/26", desc: null, start_date: "2026-04-29T13:15:00+00:00" },
      { title: "Paris Saint-Germain vs Bayern München", desc: null, start_date: "2026-04-29T14:15:00+00:00" },
      { title: "La Liga Highlights 2025/26", desc: null, start_date: "2026-04-29T14:45:00+00:00" },
      { title: "Al Ahli vs FC Machida Zelvia – AFC Champions League Elite", desc: null, start_date: "2026-04-29T15:15:00+00:00" },
      { title: "Ligue 1 Weekly Review – 2025/26", desc: null, start_date: "2026-04-29T15:45:00+00:00" },
      { title: "EPL Netbusters 2025/26", desc: null, start_date: "2026-04-29T16:15:00+00:00" },
      { title: "World Cup 2026 Amazing Facts – Arabic Teams (#13)", desc: null, start_date: "2026-04-29T16:45:00+00:00" },
      { title: "Chelsea vs Leeds – Emirates FA Cup 2025", desc: null, start_date: "2026-04-29T17:00:00+00:00" },
      { title: "Paris Saint-Germain vs Bayern München", desc: null, start_date: "2026-04-29T17:30:00+00:00" },
      { title: "⋗ Atlético de Madrid vs Arsenal – UCL 2025/26", desc: "Match en direct", start_date: "2026-04-29T18:00:00+00:00" },
      { title: "Paris Saint-Germain vs Bayern München", desc: null, start_date: "2026-04-29T21:45:00+00:00" },
      { title: "Chelsea vs Leeds – Emirates FA Cup 2025", desc: null, start_date: "2026-04-29T22:15:00+00:00" },
      { title: "Atlético de Madrid vs Arsenal – UCL 2025/26", desc: null, start_date: "2026-04-29T23:00:00+00:00" },
      { title: "Manchester City vs Southampton – FA Cup 2025", desc: null, start_date: "2026-04-29T23:45:00+00:00" },
      { title: "⋗ Estudiantes LP vs Flamengo – Copa Libertadores 2026", desc: null, start_date: "2026-04-30T00:20:00+00:00" },
      { title: "⋗ Nottingham Forest vs Aston Villa – Europa League", desc: null, start_date: "2026-04-30T18:00:00+00:00" },
    ])
  },

  // ── BEIN SPORTS 2 ────────────────────────────
  {
    channel_id: "bein-sports-2",
    channel_name: "beIN SPORTS 2",
    country: "France",
    icon: "/beinsport.png",
    info_url: "https://epg.pw/channels/443147/20260429.html",
    epg_list: computeEndDates([
      { title: "Passion sous pression", desc: null, start_date: "2026-04-29T00:00:00+00:00" },
      { title: "Ça se passe sur beIN SPORTS", desc: null, start_date: "2026-04-29T01:00:00+00:00" },
      { title: "Basket-ball : NBA", desc: "En Direct.", start_date: "2026-04-29T01:30:00+00:00" },
      { title: "Betis Séville / Real Madrid", desc: null, start_date: "2026-04-29T04:00:00+00:00" },
      { title: "Saint-Etienne / Troyes", desc: null, start_date: "2026-04-29T06:00:00+00:00" },
      { title: "Leipzig-Union Berlin", desc: null, start_date: "2026-04-29T08:00:00+00:00" },
      { title: "Chelsea / Leeds", desc: null, start_date: "2026-04-29T10:00:00+00:00" },
      { title: "Reims - Nancy", desc: null, start_date: "2026-04-29T12:00:00+00:00" },
      { title: "Galatasaray / Fenerbahçe", desc: null, start_date: "2026-04-29T14:00:00+00:00" },
      { title: "Mayence / Bayern Munich", desc: null, start_date: "2026-04-29T16:00:00+00:00" },
      { title: "Atlético Madrid / Athletic Bilbao", desc: null, start_date: "2026-04-29T18:00:00+00:00" },
      { title: "Manchester City / Southampton", desc: null, start_date: "2026-04-29T20:00:00+00:00" },
      { title: "Playoffs", desc: "En Direct.", start_date: "2026-04-29T23:00:00+00:00" },
      { title: "Liga Extra", desc: "Thomas Thouroude présente le magazine sur l'actualité du championnat espagnol.", start_date: "2026-04-30T22:00:00+00:00" },
      { title: "Made in England", desc: "Le magazine du football anglais avec Darren Tulett.", start_date: "2026-04-30T22:30:00+00:00" },
      { title: "This is Paris", desc: "Toute l'actualité du Paris Saint-Germain.", start_date: "2026-04-30T23:00:00+00:00" },
    ])
  },

  // ── BEIN SPORTS 3 ────────────────────────────
  {
    channel_id: "bein-sports-3",
    channel_name: "beIN SPORTS 3",
    country: "France",
    icon: "/beinsport.png",
    info_url: "https://epg.pw/channels/54963/20260429.html",
    epg_list: computeEndDates([
      { title: "Ça se passe sur beIN SPORTS", desc: null, start_date: "2026-04-29T04:00:00+00:00" },
      { title: "Handball : Liqui Moly StarLigue", desc: "Retransmission d'un match de la plus haute division du handball masculin.", start_date: "2026-04-29T06:00:00+00:00" },
      { title: "This is Paris", desc: null, start_date: "2026-04-29T07:30:00+00:00" },
      { title: "beIN STORY", desc: null, start_date: "2026-04-29T08:00:00+00:00" },
      { title: "Baseball : MLB", desc: "Découvrez les épreuves de la Major League Baseball.", start_date: "2026-04-29T09:00:00+00:00" },
      { title: "Tennis : Tournoi WTA de Madrid", desc: "Tournoi classé catégorie 1000 sur le WTA Tour.", start_date: "2026-04-29T11:00:00+00:00" },
      { title: "Basket-ball : NBA", desc: "Match de la prestigieuse ligue américaine de basketball.", start_date: "2026-04-29T14:00:00+00:00" },
      { title: "Be United", desc: null, start_date: "2026-04-29T16:00:00+00:00" },
      { title: "Raid des Alizées", desc: "Compétition 100% féminine en Martinique.", start_date: "2026-04-29T17:00:00+00:00" },
      { title: "Tennis : Tournoi WTA de Madrid", desc: null, start_date: "2026-04-29T18:00:00+00:00" },
      { title: "Baseball : MLB", desc: null, start_date: "2026-04-29T21:00:00+00:00" },
      { title: "Rugby : Challenge Cup", desc: "Montpellier vs Connacht — quarts de finale.", start_date: "2026-04-30T10:00:00+00:00" },
      { title: "Rugby : Champions Cup", desc: "UBB vs Stade Toulousain — choc 100% français.", start_date: "2026-04-30T12:00:00+00:00" },
      { title: "Tennis : Tournoi WTA de Madrid", desc: null, start_date: "2026-04-30T14:00:00+00:00" },
      { title: "Court Central", desc: null, start_date: "2026-04-30T19:00:00+00:00" },
      { title: "Basket-ball : NBA", desc: null, start_date: "2026-04-30T22:30:00+00:00" },
    ])
  },

  // ── BEIN SPORTS HD (CANADA) ──────────────────
  {
    channel_id: "bein-sports-hd-canada",
    channel_name: "beIN Sports HD",
    country: "Canada",
    icon: "/beinsport.png",
    info_url: "https://epg.pw/channels/470340/20260429.html",
    epg_list: computeEndDates([
      { title: "Live: The Express", desc: "Pre-match analysis and reporting.", start_date: "2026-04-29T00:00:00+00:00" },
      { title: "Live: Copa Libertadores Soccer", desc: "Group D.", start_date: "2026-04-29T00:20:00+00:00" },
      { title: "Live: Copa Libertadores Soccer", desc: "Group F.", start_date: "2026-04-29T02:30:00+00:00" },
      { title: "The Knockout Room", desc: null, start_date: "2026-04-29T04:00:00+00:00" },
      { title: "Bare Knuckle Boxing", desc: "Boxing in its purest form.", start_date: "2026-04-29T04:30:00+00:00" },
      { title: "Outdoor Sports Show", desc: null, start_date: "2026-04-29T07:00:00+00:00" },
      { title: "Copa Libertadores Soccer", desc: "Group D.", start_date: "2026-04-29T07:30:00+00:00" },
      { title: "Boundless", desc: "Adventure endurance racing with Donato & Trebilcock.", start_date: "2026-04-29T10:00:00+00:00" },
      { title: "Asia Cup Highlights", desc: null, start_date: "2026-04-29T14:30:00+00:00" },
      { title: "Asian Le Mans Series Highlights", desc: null, start_date: "2026-04-29T16:00:00+00:00" },
      { title: "Ligue 1 Show", desc: "Best moments from Ligue 1 weekend.", start_date: "2026-04-29T17:00:00+00:00" },
      { title: "T100 Triathlon World Tour", desc: "Gold Coast, Australia.", start_date: "2026-04-29T18:00:00+00:00" },
      { title: "FIBA 3x3 Asia Cup 2026 — Third Place", desc: null, start_date: "2026-04-29T19:00:00+00:00" },
      { title: "FIBA 3x3 Asia Cup 2026 — Final", desc: null, start_date: "2026-04-29T19:30:00+00:00" },
      { title: "ABSA Cape Epic", desc: null, start_date: "2026-04-29T20:00:00+00:00" },
      { title: "This is Paris", desc: "All about Paris Saint-Germain.", start_date: "2026-04-29T21:00:00+00:00" },
      { title: "Live: Copa Libertadores Soccer", desc: "Group E.", start_date: "2026-04-29T21:50:00+00:00" },
      { title: "Live: The Express", desc: null, start_date: "2026-04-30T00:00:00+00:00" },
    ])
  },

  // ── BEIN SPORTS MAX 10 ───────────────────────
  {
    channel_id: "bein-sports-max-10",
    channel_name: "beIN SPORTS MAX 10",
    country: "France",
    icon: "/beinsport.png",
    info_url: "https://epg.pw/channels/443150/20260429.html",
    epg_list: computeEndDates([
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-29T03:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-29T07:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-29T11:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-29T15:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-29T19:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-29T23:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-30T03:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-30T07:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-30T11:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-30T15:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-30T19:00:00+00:00" },
      { title: "beIN SPORTS, le plus grand des spectacles", desc: null, start_date: "2026-04-30T23:00:00+00:00" },
    ])
  },

  // ── BEIN MOVIES ──────────────────────────────
  {
    channel_id: "bein-movies",
    channel_name: "BEIN MOVIES",
    country: "France",
    icon: "https://i.imgur.com/8QKm0hU.png",
    info_url: "https://epg.pw/channels/443109/20260429.html",
    epg_list: computeEndDates([
      { title: "Yerli Sinema", desc: "Film turc — Drame familial", start_date: "2026-04-29T00:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Comédie romantique", start_date: "2026-04-29T02:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Thriller", start_date: "2026-04-29T04:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Drame historique", start_date: "2026-04-29T06:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Action", start_date: "2026-04-29T08:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Comédie", start_date: "2026-04-29T10:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Romance", start_date: "2026-04-29T12:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Drame social", start_date: "2026-04-29T14:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Aventure", start_date: "2026-04-29T16:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Suspense", start_date: "2026-04-29T18:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Drame", start_date: "2026-04-29T20:10:00+00:00" },
      { title: "Yerli Sinema", desc: "Film turc — Nocturne", start_date: "2026-04-29T22:10:00+00:00" },
    ])
  },

  // ── ESPN ─────────────────────────────────────
  {
    channel_id: "espn",
    channel_name: "ESPN",
    country: "USA",
    icon: "/espn.png",
    info_url: "",
    epg_list: computeEndDates([
      { title: "SportsCenter", desc: "Your daily sports news roundup", start_date: "2026-04-29T06:00:00+00:00" },
      { title: "NBA Playoffs — Lakers vs Celtics", desc: "Game 5 — Eastern Conference Finals", start_date: "2026-04-29T18:00:00+00:00" },
      { title: "NFL Draft Analysis", desc: "Expert breakdown of top picks", start_date: "2026-04-29T21:00:00+00:00" },
      { title: "SportsCenter Late", desc: "Evening highlights and scores", start_date: "2026-04-29T23:30:00+00:00" },
    ])
  },

  // ── FRANCE 24 ────────────────────────────────
  {
    channel_id: "france24-fr",
    channel_name: "France 24",
    country: "France",
    icon: "https://i.imgur.com/Oq8XUVW.png",
    info_url: "",
    epg_list: computeEndDates([
      { title: "Le Journal", desc: "L'actualité internationale en direct", start_date: "2026-04-29T06:00:00+00:00" },
      { title: "L'Entretien", desc: "Interview exclusive", start_date: "2026-04-29T09:00:00+00:00" },
      { title: "Le Débat", desc: "Table ronde géopolitique", start_date: "2026-04-29T12:00:00+00:00" },
      { title: "Reporters", desc: "Grand reportage", start_date: "2026-04-29T15:00:00+00:00" },
      { title: "Le Journal — Édition du Soir", desc: null, start_date: "2026-04-29T19:00:00+00:00" },
      { title: "À l'Affiche", desc: "Culture, cinéma et spectacles", start_date: "2026-04-29T21:00:00+00:00" },
    ])
  },

  // ── AL JAZEERA ───────────────────────────────
  {
    channel_id: "al-jazeera",
    channel_name: "Al Jazeera",
    country: "Qatar",
    icon: "https://i.imgur.com/sN3VFk9.png",
    info_url: "",
    epg_list: computeEndDates([
      { title: "Newshour", desc: "Global news coverage", start_date: "2026-04-29T06:00:00+00:00" },
      { title: "Inside Story", desc: "In-depth analysis", start_date: "2026-04-29T12:00:00+00:00" },
      { title: "Witness", desc: "Personal stories from around the world", start_date: "2026-04-29T16:00:00+00:00" },
      { title: "UpFront", desc: "Challenging world leaders", start_date: "2026-04-29T20:00:00+00:00" },
    ])
  },
]

export function getChannelEPG(channelId: string): ChannelEPG | undefined {
  return epgData.find(e => e.channel_id === channelId)
}

export function getCurrentProgram(channelId: string): EPGEntry | undefined {
  const channelEpg = getChannelEPG(channelId)
  if (!channelEpg) return undefined
  const now = new Date()
  return channelEpg.epg_list.find(entry => {
    const start = new Date(entry.start_date)
    const end = entry.end_date ? new Date(entry.end_date) : new Date(start.getTime() + 7200000)
    return now >= start && now < end
  })
}

export function getUpcomingPrograms(channelId: string, count = 5): EPGEntry[] {
  const channelEpg = getChannelEPG(channelId)
  if (!channelEpg) return []
  const now = new Date()
  return channelEpg.epg_list.filter(e => new Date(e.start_date) > now).slice(0, count)
}
