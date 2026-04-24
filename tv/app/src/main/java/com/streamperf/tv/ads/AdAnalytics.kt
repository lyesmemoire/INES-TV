package com.streamperf.tv.ads

import android.content.Context

/**
 * 📊 AD ANALYTICS
 * Local tracker for counting impressions and estimated revenue per provider safely at zero cost.
 */
class AdAnalytics(context: Context) {

    private val prefs = context.getSharedPreferences("ad_analytics", Context.MODE_PRIVATE)

    fun trackImpression(provider: String) {
        val key = "imp_$provider"
        val current = prefs.getInt(key, 0)
        prefs.edit().putInt(key, current + 1).apply()
    }

    fun trackRevenue(provider: String, value: Double) {
        val key = "rev_$provider"
        val current = prefs.getFloat(key, 0f)
        prefs.edit().putFloat(key, current + value.toFloat()).apply()
    }

    fun getStats(provider: String): Pair<Int, Float> {
        val imp = prefs.getInt("imp_$provider", 0)
        val rev = prefs.getFloat("rev_$provider", 0f)
        return Pair(imp, rev)
    }
}
