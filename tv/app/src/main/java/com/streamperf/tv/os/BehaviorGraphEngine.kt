package com.streamperf.tv.os

import android.content.Context
import kotlinx.coroutines.*

class BehaviorGraphEngine(context: Context) {

    private val persistence = GraphPersistence(context)
    private var graph = persistence.load() ?: BehaviorGraph()
    private val scope = CoroutineScope(Dispatchers.IO)
    private var lastSaveTime = 0L

    fun recordWatch(channelId: String, duration: Long) {
        val node = graph.nodes[channelId]

        if (node == null) {
            graph.nodes[channelId] = ChannelNode(
                channelId = channelId,
                weight = 1f,
                lastWatched = System.currentTimeMillis(),
                avgWatchTime = duration
            )
        } else {
            graph.nodes[channelId] = node.copy(
                weight = node.weight + 0.3f,
                lastWatched = System.currentTimeMillis(),
                avgWatchTime = (node.avgWatchTime + duration) / 2
            )
        }
        
        // Smart flush: every 30 seconds to minimize Disk IO.
        val now = System.currentTimeMillis()
        if (now - lastSaveTime > 30_000) {
            lastSaveTime = now
            flush()
        }
    }

    fun flush() {
        val graphCopy = BehaviorGraph(graph.nodes.toMutableMap())
        scope.launch {
            persistence.save(graphCopy)
        }
    }

    fun getGraph(): BehaviorGraph = graph
}
