package com.streamperf.tv.player.v2

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import com.streamperf.tv.models.Channel
import com.streamperf.tv.player.adaptive.TVRuntimeAdaptiveEngine

class PlaybackOrchestrator(
    private val context: Context,
    private val player: ExoPlayer,
    private val adaptiveEngine: TVRuntimeAdaptiveEngine
) {
    private val warmPool = StreamWarmPool(context, adaptiveEngine)
    private val predictiveEngine = PredictiveEngine()
    private val recoveryManager = RecoveryManagerV2(player)

    private var currentIndex = 0
    private var playlist: List<Channel> = emptyList()
    private val zapHistory = mutableListOf<Int>()

    init {
        recoveryManager.bind()
    }

    fun loadPlaylist(channels: List<Channel>, startIndex: Int) {
        playlist = channels
        currentIndex = startIndex

        val mediaItems = channels.mapNotNull {
            val uri = it.streamUrl ?: return@mapNotNull null
            MediaItem.Builder().setUri(uri).setMediaId(it.id).build()
        }

        player.setMediaItems(mediaItems, startIndex, androidx.media3.common.C.TIME_UNSET)
        player.prepare()
        
        // Exact Trick: Avoid waiting for buffer init completely 
        player.playWhenReady = true

        warmSurrounding()
    }

    fun zapNext() {
        if (currentIndex < playlist.size - 1) {
            updateHistory()
            currentIndex++
            player.seekToNextMediaItem()
            warmSurrounding()
        }
    }

    fun zapPrevious() {
        if (currentIndex > 0) {
            updateHistory()
            currentIndex--
            player.seekToPreviousMediaItem()
            warmSurrounding()
        }
    }

    private fun updateHistory() {
        zapHistory.add(currentIndex)
        if (zapHistory.size > 10) zapHistory.removeAt(0)
    }

    private fun warmSurrounding() {
        val predictions = predictiveEngine.predictNext(
            currentIndex = currentIndex,
            history = zapHistory,
            totalChannels = playlist.size
        )

        val urlsToWarm = predictions.mapNotNull { playlist.getOrNull(it)?.streamUrl }
        warmPool.warm(urlsToWarm)
    }

    fun getPlayer() = player

    fun release() {
        player.stop()
        player.clearMediaItems()
        warmPool.release()
    }
}
