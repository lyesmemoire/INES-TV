package com.streamperf.tv.ui.player

import androidx.compose.runtime.*
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.ui.PlayerView
import com.streamperf.tv.player.TvPlayerManager
import androidx.media3.common.util.UnstableApi

/**
 * 📺 TV PLAYER VIEW
 * AndroidView wrapper for Media3 PlayerView, optimized for TV.
 * Dynamically reacts to player swaps (seamless zapping).
 */
@OptIn(UnstableApi::class)
@Composable
fun TvPlayerView(manager: TvPlayerManager) {
    // Observe the active player from the manager
    val activePlayer by remember { manager.activePlayerState } ?: return

    AndroidView(
        factory = { context ->
            PlayerView(context).apply {
                useController = false
                this.player = activePlayer
            }
        },
        update = { view ->
            // Update the player on the view if it has swapped
            if (view.player != activePlayer) {
                view.player = activePlayer
            }
        }
    )
}
