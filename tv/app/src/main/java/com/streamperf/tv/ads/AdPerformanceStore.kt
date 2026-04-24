package com.streamperf.tv.ads

import android.content.Context

/**
 * 📊 AD PERFORMANCE MEMORY (LOCAL AI SIMPLE)
 * Locally records revenue and calculates an average score per provider to enable self-learning optimization.
 */
class AdPerformanceStore(context: Context) {

    private val prefs = context.getSharedPreferences("ad_perf", Context.MODE_PRIVATE)

    fun record(provider: String, revenue: Float, qoe: Double) {
        val key = provider

        val oldRev = prefs.getFloat("${key}_rev", 0f)
        val oldCount = prefs.getInt("${key}_count", 0)

        prefs.edit()
            .putFloat("${key}_rev", oldRev + revenue)
            .putInt("${key}_count", oldCount + 1)
            .apply()
    }

    /**
     * Calculates the average revenue proxy for sorting.
     */
    fun getScore(provider: String): Float {
        val rev = prefs.getFloat("${provider}_rev", 0f)
        val count = prefs.getInt("${provider}_count", 1)

        return rev / count // average revenue proxy
    }
}
