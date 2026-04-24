package com.streamperf.tv.os

import com.streamperf.tv.models.Channel

class SmartZapEngine(private val graph: BehaviorGraph) {

    fun predictNext(current: String, channels: List<Channel>): Channel? {
        val currentNode = graph.nodes[current] ?: return null

        return channels.filter { it.id != current }.maxByOrNull { channel ->
            val node = graph.nodes[channel.id]
            
            val baseWeight = (node?.weight ?: 0f)
            val recencyScoring = 1f / (((System.currentTimeMillis() - (node?.lastWatched ?: 0L)) / 60000f) + 1f)
            
            baseWeight + recencyScoring
        }
    }
}
