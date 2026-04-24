package com.streamperf.tv.player

import android.content.Context
import androidx.media3.common.MediaItem
import com.streamperf.tv.models.Channel
import com.streamperf.tv.player.adaptive.TVRuntimeAdaptiveEngine

class PlaybackController(private val context: Context) {
    private val engine = TVRuntimeAdaptiveEngine(context)
    private val player = TvPlayerEngine.init(context, engine)

    fun startPlaylist(channels: List<Channel>, startIndex: Int = 0) {
        val mediaItems = channels.mapNotNull { channel ->
            val streamUri = channel.streamUrl ?: return@mapNotNull null
            MediaItem.Builder()
                .setUri(streamUri)
                .setMediaId(channel.id)
                .build()
        }

        player.setMediaItems(mediaItems, startIndex, androidx.media3.common.C.TIME_UNSET)
        player.prepare()
        player.playWhenReady = true
    }

    fun zapNext() {
        if (player.hasNextMediaItem()) {
            player.seekToNextMediaItem()
            player.playWhenReady = true
        }
    }

    fun zapPrevious() {
        if (player.hasPreviousMediaItem()) {
            player.seekToPreviousMediaItem()
            player.playWhenReady = true
        }
    }
    
    fun stop() {
        player.stop()
        player.clearMediaItems()
    }

    fun getPlayer() = player
}
