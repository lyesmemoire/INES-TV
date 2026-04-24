package com.streamperf.tv.os

import android.content.Context
import com.streamperf.tv.models.Channel

class AITVOSOrchestrator(context: Context) {

    val graphEngine = BehaviorGraphEngine(context)
    private val graph = graphEngine.getGraph()

    private val ai = AIRecommendationEngine(graph)
    private val home = HomeScreenEngine(ai, graph)
    private val zap = SmartZapEngine(graph)
    private val attention = AttentionEngine()
    private val signals = LiveSignalEngine()

    fun buildHome(channels: List<Channel>): List<HomeSection> {
        return home.generate(channels)
    }

    fun onWatch(channel: Channel, durationMs: Long) {
        val scoreAmplifier = attention.getAttentionScore(durationMs)
        graphEngine.recordWatch(channel.id, durationMs) // Duration gets calculated into average
    }

    fun suggestNext(channel: Channel, channels: List<Channel>): Channel? {
        return zap.predictNext(channel.id, channels)
    }
    
    fun resetSession() {
        attention.resetSession()
    }
    
    fun shutdown() {
        graphEngine.flush()
    }
}
