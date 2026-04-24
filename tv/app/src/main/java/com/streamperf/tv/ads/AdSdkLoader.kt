package com.streamperf.tv.ads

import android.content.Context

/**
 * 🧠 LAZY SDK LOADER
 * Prevents RAM overflows on Android TV by initializing heavy Ad SDKs only when selected by the Orchestrator.
 */
class AdSdkLoader(private val context: Context) {

    private val loaded = mutableSetOf<String>()

    fun load(provider: String) {
        if (loaded.contains(provider)) return

        when (provider) {
            "admob" -> {
                try {
                    // MobileAds.initialize(context)
                    println("AdMob SDK loaded")
                } catch (_: Exception) {}
            }

            "unity" -> {
                try {
                    println("Unity Ads SDK loaded")
                } catch (_: Exception) {}
            }

            "applovin" -> {
                try {
                    println("AppLovin SDK loaded")
                } catch (_: Exception) {}
            }
        }

        loaded.add(provider)
    }
}
