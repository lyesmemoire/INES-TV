package com.streamperf.tv.models

import kotlinx.serialization.Serializable

/**
 * 🧠 INTELLIGENCE EVENT MODEL
 * Stabilized version with consistent fields for OS-TV sync.
 */
@Serializable
data class IntelligenceEvent(
    val id: String = "",
    val type: String = "", // 'GOAL', 'RED_CARD', etc.
    val channelId: String = "",
    val userId: String? = null,
    val data: Map<String, String> = emptyMap(),
    val timestamp: Long = System.currentTimeMillis()
)

@Serializable
data class UserFavoriteTeam(
    val id: String = "",
    val user_id: String = "",
    val team_name: String = ""
)
