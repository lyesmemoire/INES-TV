package com.streamperf.tv.player

import androidx.media3.common.C
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class PlaybackRecoveryManager(private val player: ExoPlayer) {
    private var retryCount = 0
    private val maxRetries = 3
    private val scope = CoroutineScope(Dispatchers.Main)

    private val playerListener = object : Player.Listener {
        override fun onPlayerError(error: PlaybackException) {
            super.onPlayerError(error)
            handleError()
        }

        override fun onPlaybackStateChanged(playbackState: Int) {
            if (playbackState == Player.STATE_READY) {
                // Reset failure count when playback successfully resumes
                reset()
            }
        }
    }

    fun attach() {
        player.addListener(playerListener)
    }

    private fun handleError() {
        if (retryCount >= maxRetries) return
        retryCount++

        scope.launch {
            delay(1500)
            val currentIndex = player.currentMediaItemIndex
            if (currentIndex != C.INDEX_UNSET) {
                player.seekTo(currentIndex, C.TIME_UNSET)
                player.prepare()
                player.play()
            }
        }
    }

    fun reset() {
        retryCount = 0
    }
}
