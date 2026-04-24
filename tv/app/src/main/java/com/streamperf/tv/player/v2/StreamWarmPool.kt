package com.streamperf.tv.player.v2

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import com.streamperf.tv.player.adaptive.TVRuntimeAdaptiveEngine

class StreamWarmPool(private val context: Context, private val adaptiveEngine: TVRuntimeAdaptiveEngine) {

    private val isAllowed = adaptiveEngine.getWarmPoolEnabled()
    private var cachePlayer: ExoPlayer? = null
    private val warmMap = mutableMapOf<String, Long>()
    private var lastUse: Long = System.currentTimeMillis()

    init {
        if (isAllowed) {
            val allocator = androidx.media3.exoplayer.upstream.DefaultAllocator(true, 16 * 1024)
            cachePlayer = ExoPlayer.Builder(context.applicationContext)
                .setLoadControl(
                    DefaultLoadControl.Builder()
                        .setAllocator(allocator)
                        .setBufferDurationsMs(
                            5_000, 30_000, 1_500, 3_000
                        ).build()
                )
                .build()
        }
    }

    fun warm(urls: List<String>) {
        if (!isAllowed) return
        lastUse = System.currentTimeMillis()
        val player = cachePlayer ?: return

        player.clearMediaItems()
        urls.forEach { url ->
            val mediaItem = MediaItem.Builder().setUri(url).build()
            player.addMediaItem(mediaItem)
            warmMap[url] = System.currentTimeMillis()
        }
        
        player.prepare()
        player.playWhenReady = false 

        releaseOld()
        cleanupIdlePool()
    }

    fun isWarm(url: String): Boolean {
        return warmMap.containsKey(url)
    }

    private fun releaseOld() {
        val cutoff = System.currentTimeMillis() - 120_000 
        warmMap.entries.removeIf { it.value < cutoff }
    }

    /**
     * 🔴 RISQUE #4 FIX: WarmPool Idle Cleanup
     */
    private fun cleanupIdlePool() {
        if (System.currentTimeMillis() - lastUse > 60_000) {
            cachePlayer?.stop()
            cachePlayer?.clearMediaItems()
            cachePlayer?.release()
            cachePlayer = null
        }
    }

    fun release() {
        cachePlayer?.stop()
        cachePlayer?.clearMediaItems()
        cachePlayer?.release()
        cachePlayer = null
        warmMap.clear()
    }
}
