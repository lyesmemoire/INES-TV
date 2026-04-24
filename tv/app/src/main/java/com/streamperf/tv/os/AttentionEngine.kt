package com.streamperf.tv.os

class AttentionEngine {

    private var sessionStart = System.currentTimeMillis()

    fun resetSession() {
        sessionStart = System.currentTimeMillis()
    }

    fun getAttentionScore(durationMs: Long): Float {
        val sessionTime = System.currentTimeMillis() - sessionStart
        return (durationMs.toFloat() / (sessionTime + 1)) * 10f
    }
}

class LiveSignalEngine {
    fun computeTrendScore(channelId: String, zapCount: Int, epgHot: Boolean): Float {
        var score = zapCount.toFloat()
        if (epgHot) score += 5f
        return score
    }
}
