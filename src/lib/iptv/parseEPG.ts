/**
 * 📡 XMLTV EPG PARSER (Server-Side)
 * 
 * Cette version fonctionne côté serveur (Node.js/Vercel) sans DOMParser.
 * Gère le format XMLTV standard et convertit les dates complexes.
 */

export type EPGProgram = {
  channel: string
  title: string
  start: string // ISO
  stop: string  // ISO
}

/**
 * Parse une date XMLTV (format: 20240501183000 +0200)
 */
function parseXMLTVDate(xmltvDate: string): string {
  // Format attendu: YYYYMMDDHHMMSS +HHMM
  const matches = xmltvDate.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s?([+-]\d{4})?$/)
  if (!matches) return new Date().toISOString()

  const [_, y, m, d, hh, mm, ss, tz] = matches
  const dateStr = `${y}-${m}-${d}T${hh}:${mm}:${ss}${tz || ""}`
  return new Date(dateStr).toISOString()
}

/**
 * Version ultra-légère sans dépendances lourdes pour le parsing XML basique.
 */
export async function fetchEPG(url: string): Promise<EPGProgram[]> {
  const res = await fetch(url)
  const xml = await res.text()

  const programs: EPGProgram[] = []
  
  // Utilisation d'une regex robuste pour extraire les programmes sans DOMParser
  const programRegex = /<programme[^>]*channel="([^"]*)"[^>]*start="([^"]*)"[^>]*stop="([^"]*)"[^>]*>[\s\S]*?<title[^>]*>([\s\S]*?)<\/title>[\s\S]*?<\/programme>/g
  
  let match
  while ((match = programRegex.exec(xml)) !== null) {
    const [_, channelId, start, stop, title] = match
    
    programs.push({
      channel: channelId,
      title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim(),
      start: parseXMLTVDate(start),
      stop: parseXMLTVDate(stop),
    })
  }

  return programs
}
