package com.streamperf.tv.player.v2

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import com.streamperf.tv.models.Channel
import com.streamperf.tv.player.adaptive.AdaptiveWarmController
import com.streamperf.tv.player.adaptive.TVRuntimeAdaptiveEngine
import com.streamperf.tv.utils.TVCrashLogger

class RuntimeOrchestrator(
    private val context: Context,
    private val player: ExoPlayer,
    private val engine: TVRuntimeAdaptiveEngine
) {
    private val warmPool = StreamWarmPool(context, engine)
    private val warmController = AdaptiveWarmController(engine, warmPool)
    
    private val predictiveEngine = PredictiveEngine()
    private val recoveryManager = RecoveryManagerV2(player)

    private var currentIndex = 0
    private var playlist: List<Channel> = emptyList()
    private val zapHistory = mutableListOf<Int>()

    init {
        recoveryManager.bind()
        
        player.addListener(object : androidx.media3.common.Player.Listener {
            override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                TVCrashLogger.log("ExoPlayer_Playback", error)
            }
        })
    }

    fun start(channels: List<Channel>, startIndex: Int) {
        playlist = channels
        currentIndex = startIndex

        val mediaItems = channels.mapNotNull {
            val uri = it.streamUrl ?: return@mapNotNull null
            MediaItem.Builder().setUri(uri).setMediaId(it.id).build()
        }

        player.setMediaItems(mediaItems, startIndex, androidx.media3.common.C.TIME_UNSET)
        player.prepare()
        player.playWhenReady = true

        warmSurrounding()
    }

    fun onZapNext() {
        if (currentIndex < playlist.size - 1) {
            updateHistory()
            currentIndex++
            player.seekToNextMediaItem()
            warmSurrounding()
        }
    }

    fun onZapPrev() {
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
        warmController.warm(urlsToWarm)
    }

    fun getPlayer() = player

    fun release() {
        player.stop()
        player.clearMediaItems()
        warmPool.release()
    }
}
