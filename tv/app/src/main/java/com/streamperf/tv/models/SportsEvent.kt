package com.streamperf.tv.models

import androidx.compose.runtime.Immutable
import kotlinx.serialization.Serializable

@Serializable
@Immutable
data class SportsEvent(
    val id: String,
    val home_team: String,
    val away_team: String,
    val home_logo: String? = null,
    val away_logo: String? = null,
    val competition: String,
    val status: String, // 'live', 'upcoming', 'finished'
    val score_home: Int = 0,
    val score_away: Int = 0,
    val match_time: String = "0'",
    val start_time: String,
    val channel_id: String? = null,
    val importance_score: Float = 1.0f,
    val channels: Channel? = null // Nested channel details from Supabase Join
)
