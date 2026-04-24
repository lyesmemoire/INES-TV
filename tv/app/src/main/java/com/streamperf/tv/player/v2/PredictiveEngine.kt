package com.streamperf.tv.player.v2

class PredictiveEngine {

    fun predictNext(
        currentIndex: Int,
        history: List<Int>, // Last N indices visited
        totalChannels: Int
    ): List<Int> {
        val patternBias = history.takeLast(5)

        val forward = (currentIndex + 1).coerceAtMost(if (totalChannels > 0) totalChannels - 1 else 0)
        val backward = (currentIndex - 1).coerceAtLeast(0)

        return listOfNotNull(
            forward,
            backward,
            patternBias.lastOrNull() ?: (forward + 1).coerceAtMost(if (totalChannels > 0) totalChannels - 1 else 0)
        ).distinct().filter { it != currentIndex }
    }
}
