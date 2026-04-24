package com.streamperf.tv.player.qoe

class QoEEngine {

    private var startTime = 0L
    private var firstFrameTime = 0L
    private var rebufferTime = 0L
    private var rebufferCount = 0

    fun onStart() {
        startTime = System.currentTimeMillis()
    }

    fun onFirstFrame() {
        firstFrameTime = System.currentTimeMillis()
    }

    fun onBufferStart() {
        rebufferCount++
    }

    fun onBufferEnd(duration: Long) {
        rebufferTime += duration
    }

    fun computeScore(): Int {
        val startup = (firstFrameTime - startTime).coerceAtLeast(1)
        val penaltyStartup = (startup / 100).toInt()
        val penaltyBuffer = (rebufferTime / 1000).toInt()

        return (100 - penaltyStartup - penaltyBuffer).coerceIn(0, 100)
    }
}
