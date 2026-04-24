package com.streamperf.tv.os

import com.streamperf.tv.models.Channel

class AIRecommendationEngine(private val graph: BehaviorGraph) {

    fun recommend(channels: List<Channel>): List<Channel> {
        return channels.sortedByDescending { channel ->
            val node = graph.nodes[channel.id]

            val base = node?.weight ?: 0f
            val recency = node?.lastWatched?.let {
                1f / (((System.currentTimeMillis() - it) / 60000f) + 1f)
            } ?: 0f

            val engagement = node?.avgWatchTime?.toFloat() ?: 0f

            base * 2f + recency + (engagement / 10000f)
        }
    }
}
