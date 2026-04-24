package com.streamperf.tv.analytics

import com.streamperf.tv.player.qoe.QoEMetrics
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.*

/**
 * 📊 ANALYTICS TRACKER
 * Bridges the TV Player metrics with the Supabase OS analytics engine.
 * Feature: Enriched payloads for granular performance monitoring.
 */
class AnalyticsTracker(
    private val supabase: SupabaseClient
) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    /**
     * 🛰️ TRACK EVENT
     * Asynchronously logs stream performance and detailed QoE snapshots.
     */
    fun trackEvent(
        tenantId: String = "client_001",
        channelId: String,
        eventType: String,
        cdn: String?,
        qoeScore: Double,
        metrics: QoEMetrics? = null
    ) {
        scope.launch {
            try {
                // 🔥 ZERO COST FRAUD / QUALITY SECURE LAYER
                if (!isValidEvent(qoeScore)) {
                    println("Analytics blocked: Suspected spam or ultra-low QoE.")
                    return@launch
                }

                val data = mutableMapOf<String, Any?>(
                    "tenant_id" to tenantId,
                    "channel_id" to channelId,
                    "event_type" to eventType,
                    "cdn" to cdn,
                    "qoe_score" to qoeScore,
                    "timestamp" to System.currentTimeMillis()
                )
                
                // 🔥 ENRICHED PAYLOAD
                metrics?.let {
                    data["startup_time"] = it.startupTime
                    data["rebuffer_count"] = it.rebufferCount
                    data["rebuffer_duration"] = it.rebufferDuration
                    data["error_count"] = it.errorCount
                }

                val table = if (eventType in listOf("impression", "click", "revenue")) "ad_events" else "stream_events"
                if (table == "ad_events") {
                    data["provider"] = cdn ?: "unknown"
                    if (!data.containsKey("revenue")) data["revenue"] = if (eventType == "revenue") 1.0 else 0.0
                }
                supabase.postgrest[table].insert(data)
            } catch (e: Exception) {
                println("Analytics error: ${e.message}")
            }
        }
    }

    private fun isValidEvent(qoe: Double): Boolean {
        // Enforce QoS boundary (ignore garbage events/loops)
        return qoe > 30.0
    }
}
