package com.streamperf.tv.player.adaptive

import com.streamperf.tv.player.v2.StreamWarmPool

class AdaptiveWarmController(
    private val engine: TVRuntimeAdaptiveEngine,
    private val warmPool: StreamWarmPool
) {
    fun warm(streams: List<String>) {
        val limit = engine.getMaxPreloadStreams()
        if (limit > 0) {
            warmPool.warm(streams.take(limit))
        }
    }
}
