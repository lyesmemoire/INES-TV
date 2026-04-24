package com.streamperf.tv

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.functions.Functions

object SupabaseManager {
    private const val SUPABASE_URL = "https://mwlrfygdnrcgzlzyvmqv.supabase.co"
    private const val SUPABASE_KEY = "sb_publishable__LyFCF0pH6EqQ6dT4orc9A_mrzUuke4"

    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_KEY
    ) {
        install(Postgrest)
        install(Realtime)
        install(Auth)
        install(Functions)
    }
}
