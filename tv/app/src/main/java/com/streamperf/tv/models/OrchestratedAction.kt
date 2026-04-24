package com.streamperf.tv.models

import kotlinx.serialization.Serializable

/**
 * 🆕 ORCHESTRATED ACTION MODEL
 * Represents a command sent from the OS orchestrator (Edge/Cloud) to the TV.
 */
@Serializable
data class OrchestratedAction(
    val id: String = "",
    val action_type: String = "",
    val channel_id: String = "",
    val payload: Map<String, String> = emptyMap(),
    val timestamp: Long = System.currentTimeMillis()
)
