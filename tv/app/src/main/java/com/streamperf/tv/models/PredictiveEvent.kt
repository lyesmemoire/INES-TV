package com.streamperf.tv.models

import kotlinx.serialization.Serializable

/**
 * ⚡ PREDICTIVE EVENT MODEL
 * Stabilized version with safe defaults for OS-TV sync.
 */
@Serializable
data class PredictiveEvent(
    val id: String = "",
    val match_id: String? = null,
    val event_type: String = "", // 'MOMENTUM_SPIKE', 'HIGH_PRESSURE'
    val confidence: Float = 0.0f,
    val message: String = "",
    val created_at: String = "",
    val sports_events: SportsEvent? = null
)
