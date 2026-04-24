package com.streamperf.tv.os

import android.content.Context
import com.streamperf.tv.SupabaseManager
import com.streamperf.tv.models.*
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.serialization.json.Json

/**
 * ⚡ TV INTELLIGENCE MANAGER
 * Real-time listener for OS orchestrator events and analytics-driven actions.
 * Feature: Auto-Reconnect + Event Deduplication + Remote Command Orchestration.
 */
class TVIntelligenceManager(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    private val _events = MutableSharedFlow<IntelligenceEvent>()
    val events = _events.asSharedFlow()

    private val _predictiveEvents = MutableSharedFlow<PredictiveEvent>()
    val predictiveEvents = _predictiveEvents.asSharedFlow()
    
    // 🕹️ REMOTE PLAYER COMMANDS (Pilot from SaaS Dashboard)
    private val _remoteCommands = MutableSharedFlow<OrchestratedAction>()
    val remoteCommands = _remoteCommands.asSharedFlow()

    private var favorites = setOf<String>()
    
    private val processedIds = mutableSetOf<String>()

    fun start(userId: String) {
        scope.launch {
            // 1. Fetch User Favorites
            try {
                val favs = SupabaseManager.client.postgrest["user_favorite_teams"]
                    .select {
                        filter { eq("user_id", userId) }
                    }
                    .decodeList<UserFavoriteTeam>()
                favorites = favs.map { it.team_name.lowercase() }.toSet()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // 2. REALTIME OS ORCHESTRATOR
            setupRealtimeChannel()
        }
    }

    private fun setupRealtimeChannel() {
        val channel = SupabaseManager.client.realtime.channel("tv-events")

        val changeFlow = channel.postgresChangeFlow<PostgresAction.Insert>(
            schema = "public"
        ) {
            table = "stream_events"
        }

        // 🔥 AUTO RECONNECT LOGIC
        scope.launch {
            channel.status.collect { status ->
                if (status == RealtimeChannel.Status.UNSUBSCRIBED) {
                    println("Realtime disconnected → reconnecting...")
                    delay(2500)
                    channel.subscribe()
                }
            }
        }

        scope.launch {
            changeFlow.collect { action ->
                try {
                    val orchestrated = Json.decodeFromJsonElement(OrchestratedAction.serializer(), action.record)
                    
                    if (!processedIds.contains(orchestrated.id)) {
                        processedIds.add(orchestrated.id)
                        if (processedIds.size > 200) {
                            processedIds.remove(processedIds.first())
                        }
                        
                        // 🔥 REMOTE COMMAND ORCHESTRATION
                        if (orchestrated.action_type == "remote_control" || 
                            orchestrated.action_type == "switch_cdn") {
                            _remoteCommands.emit(orchestrated)
                        } else {
                            handleOrchestratedAction(orchestrated)
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }

        scope.launch {
            channel.subscribe()
        }
    }

    private suspend fun handleOrchestratedAction(action: OrchestratedAction) {
        when (action.action_type) {
            "overlay" -> {
                _events.emit(IntelligenceEvent(
                    id = action.id,
                    type = action.payload["type"] ?: "EVENT",
                    channelId = action.channel_id,
                    data = action.payload,
                    timestamp = action.timestamp
                ))
            }
            "notification" -> {
                val type = action.payload["type"] ?: "SPIKE"
                val message = action.payload["message"] ?: "Momentum en hausse !"
                _predictiveEvents.emit(PredictiveEvent(
                    id = action.id,
                    event_type = type,
                    message = message
                ))
            }
        }
    }

    fun isFavorite(team: String?): Boolean {
        return team?.lowercase()?.let { favorites.contains(it) } ?: false
    }

    fun stop() {
        scope.cancel()
    }
}
