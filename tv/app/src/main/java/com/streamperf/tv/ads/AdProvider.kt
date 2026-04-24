package com.streamperf.tv.ads

data class AdProvider(
    val name: String,
    val baseEcpm: Double,
    val enabled: Boolean = true
) {
    var successRate: Double = 1.0
    var avgLatency: Long = 500L
    var lastShown: Long = 0L
}
