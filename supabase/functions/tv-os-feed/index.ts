import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse requested user
    const { userId } = await req.json()

    if (!userId) {
      throw new Error("Missing userId parameter")
    }

    // 1. Fetch Personalized Recommendations through the new Scoring Engine (v2)
    const { data: rankedData, error: rankedError } = await supabaseClient
      .rpc('rank_feed_v2', { p_user_id: userId })
      
    if (rankedError) throw rankedError

    // 2. Fetch Full Details for Personalized Channels
    const rankedIds = (rankedData || []).map((r: any) => r.channel_id)
    let personalizedChannels: any[] = []
    if (rankedIds.length > 0) {
      const { data: fullChannels } = await supabaseClient
        .from('channels')
        .select('*')
        .in('id', rankedIds)
      
      // Sort by the same order as rankedData
      personalizedChannels = rankedIds.map(id => fullChannels?.find(c => c.id === id)).filter(Boolean)
    }

    // 3. Fetch Momentum/Predictive Events (High Priority)
    const { data: predictiveEvents } = await supabaseClient
      .from('predictive_events')
      .select('*, sports_events(*)')
      .order('created_at', { ascending: false })
      .limit(5)

    // 4. Fetch Live Sports (Hero Layer)
    const { data: liveSports } = await supabaseClient
      .from('sports_events')
      .select('*, channels(*)')
      .eq('status', 'live')
      .order('importance_score', { ascending: false })

    // Agreggating Feed Structure Pipeline (v13 Priority)
    const homeFeedPayload = {
      liveSports: liveSports || [],
      predictiveEvents: predictiveEvents || [],
      personalized: personalizedChannels,
      trending: personalizedChannels.slice(0, 5), // V2: Use top personalized as trending for now
    }

    return new Response(
      JSON.stringify(homeFeedPayload),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
