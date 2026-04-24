package com.streamperf.tv.player.v2

import androidx.media3.common.C
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class RecoveryManagerV2(
    private val player: ExoPlayer
) {
    private var lastValidIndex = 0
    private var lastValidPosition = 0L

    fun bind() {
        player.addListener(object : Player.Listener {
            override fun onEvents(player: Player, events: Player.Events) {
                // Record state snapshot natively from events
                if (player.currentMediaItemIndex != C.INDEX_UNSET) {
                    lastValidIndex = player.currentMediaItemIndex
                    val pos = player.currentPosition
                    if (pos > 0) {
                        lastValidPosition = pos
                    }
                }
            }

            override fun onPlayerError(error: PlaybackException) {
                recover()
            }
        })
    }

    private fun recover() {
        CoroutineScope(Dispatchers.Main).launch {
            delay(1200)
            
            // Re-mount the playback dynamically using exact saved position if applicable
            player.seekTo(lastValidIndex, if (lastValidPosition > 0) lastValidPosition else C.TIME_UNSET)
            player.prepare()
            player.playWhenReady = true
        }
    }
}
