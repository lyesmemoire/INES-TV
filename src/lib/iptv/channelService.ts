import { supabase } from "@/lib/supabase"
import { Channel } from "@/src/types"

/**
 * 📺 CHANNEL SERVICE (Server-Side)
 * Version ultra-robuste avec tolérance aux erreurs d'ID et de cache.
 */

export async function getChannelById(id: string): Promise<Channel | null> {
  if (!id) return null
  const normalizedId = id.toLowerCase().trim()
  
  console.log(`[ChannelService] Final Debug - ID: "${id}" | Normalized: "${normalizedId}"`)

  // 1. 🔓 DÉCODAGE BASE64 (Priorité absolue pour les flux encodés)
  try {
    if (id.length > 15) {
      const decoded = Buffer.from(id, 'base64').toString('utf-8')
      if (decoded.includes('http')) {
        console.log(`[ChannelService] ✅ Base64 Decoded: ${decoded}`)
        const parts = decoded.split('http')
        return {
          id: id,
          name: parts[0].trim() || "Flux Direct",
          streamUrl: 'http' + parts[1],
          logo: '/placeholder-logo.png',
          category: 'Live Stream'
        } as Channel
      }
    }
  } catch (e) {}

  // 2. 🚀 MAP DE SECOURS (Supporte IDs, Slugs et Mots-clés)
  const fallbackMap: Record<string, { name: string, url: string }> = {
    // Mapping par ID (Nouveau système)
    '1': { name: 'PSG vs OM', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    '2': { name: 'Real Madrid vs Barca', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    '3': { name: 'Man City vs Arsenal', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    '4': { name: 'Bayern vs Dortmund', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    '5': { name: 'Juventus vs Inter', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    
    // Mapping par Slug (Ancien système / Transition)
    'paris_saint_germain': { name: 'PSG vs OM', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    'real_madrid': { name: 'Real Madrid vs Barca', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    'baby_shark_tv': { name: 'Baby Shark TV', url: 'https://t.freetv.fun/live/baby-shark-tv-2.m3u8' },
    'baby_shark': { name: 'Baby Shark TV', url: 'https://t.freetv.fun/live/baby-shark-tv-2.m3u8' }
  }

  // Recherche directe ou par mot-clé
  let found = fallbackMap[id] || fallbackMap[normalizedId]
  
  // Recherche "souple" pour Baby Shark
  if (!found && normalizedId.includes('shark')) {
    found = fallbackMap['baby_shark_tv']
  }

  if (found) {
    console.log(`[ChannelService] ✅ Fallback Found: ${found.name}`)
    return {
      id: id,
      name: found.name,
      streamUrl: found.url,
      logo: '/placeholder-logo.png',
      category: 'Demo Content',
      description: `Contenu de démonstration : ${found.name}`
    } as Channel
  }

  // 3. 🗄️ SUPABASE (Recherche ultime)
  try {
    const { data } = await supabase
      .from("channels")
      .select("*, stream_sources(*)")
      .or(`id.eq."${id}",slug.eq."${normalizedId}"`)
      .maybeSingle()

    if (data) {
      return {
        ...data,
        streamUrl: data.stream_sources?.[0]?.url || "",
        sources: data.stream_sources?.map((s: any) => s.url) || []
      } as Channel
    }
  } catch (err) {}

  console.warn(`[ChannelService] ❌ ID not found anywhere: ${id}`)
  return null
}

export async function getRecommendations(excludeId: string, limit = 6): Promise<Channel[]> {
  try {
    const { data } = await supabase.from("channels").select("*").neq("id", excludeId).limit(limit)
    return (data || []) as Channel[]
  } catch (err) {
    return []
  }
}
