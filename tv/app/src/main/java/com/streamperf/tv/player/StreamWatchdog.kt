package com.streamperf.tv.player

import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import kotlinx.coroutines.*

/**
 * Watchdog that monitors ExoPlayer playback for stalls.
 * If the player is stuck (buffering > [stallThresholdMs]), it retries
 * up to [maxRetries] times with exponential back-off.
 */
@OptIn(UnstableApi::class)
class StreamWatchdog(
    private val player: Player,
    private val stallThresholdMs: Long = 8_000L,
    private val maxRetries: Int = 3,
    private val onGiveUp: () -> Unit = {}
) {
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var stallJob: Job? = null
    private var retryCount = 0

    private val listener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            when (playbackState) {
                Player.STATE_BUFFERING -> startStallTimer()
                Player.STATE_READY -> cancelStallTimer()
                Player.STATE_ENDED, Player.STATE_IDLE -> cancelStallTimer()
            }
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            if (isPlaying) {
                cancelStallTimer()
                retryCount = 0
            }
        }

        override fun onPlayerError(error: PlaybackException) {
            cancelStallTimer()
            attemptRecovery()
        }
    }

    fun attach() {
        player.addListener(listener)
    }

    fun detach() {
        player.removeListener(listener)
        scope.cancel()
    }

    private fun startStallTimer() {
        if (stallJob?.isActive == true) return
        stallJob = scope.launch {
            delay(stallThresholdMs)
            attemptRecovery()
        }
    }

    private fun cancelStallTimer() {
        stallJob?.cancel()
        stallJob = null
    }

    private fun attemptRecovery() {
        if (retryCount >= maxRetries) {
            onGiveUp()
            return
        }
        retryCount++

        // Exponential back-off: 2s, 4s, 8s
        val backoffMs = (2_000L * (1 shl (retryCount - 1))).coerceAtMost(10_000L)
        scope.launch {
            delay(backoffMs)
            if (player.playbackState != Player.STATE_READY) {
                player.prepare()
                player.play()
            }
        }
    }
}
