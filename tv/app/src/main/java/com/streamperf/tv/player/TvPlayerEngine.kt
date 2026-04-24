package com.streamperf.tv.player

import android.content.Context
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import com.streamperf.tv.player.adaptive.TVRuntimeAdaptiveEngine

@androidx.annotation.OptIn(UnstableApi::class)
object TvPlayerEngine {
    private var exoPlayer: ExoPlayer? = null

    fun init(context: Context, engine: TVRuntimeAdaptiveEngine): ExoPlayer {
        if (exoPlayer == null) {
            val allocator = DefaultAllocator(true, 16 * 1024)
            val loadControl = DefaultLoadControl.Builder()
                .setAllocator(allocator)
                .setBufferDurationsMs(
                    5_000,
                    30_000,
                    1_500,
                    3_000
                )
                .build()

            exoPlayer = ExoPlayer.Builder(context.applicationContext)
                .setLoadControl(loadControl)
                .build().apply {
                    setSeekParameters(engine.getSeekParameters())
                }
        }
        return exoPlayer!!
    }

    fun getPlayer(): ExoPlayer = exoPlayer ?: throw IllegalStateException("TvPlayerEngine not initialized")
    
    fun release() {
        exoPlayer?.release()
        exoPlayer = null
    }
}
