package com.streamperf.tv.ui.player

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.streamperf.tv.player.*

/**
 * 🎬 TV PLAYER SCREEN
 * High-level orchestration for playback of specified stream sources.
 * Supports V3 OTT features (Seamless Switch / QoE).
 */
@Composable
fun TvPlayerScreen(
    channelId: String,
    sources: List<StreamSource>
) {
    val vm: TvPlayerViewModel = viewModel()
    val context = LocalContext.current

    // Initialize manager with context
    val manager = remember(context) { TvPlayerManager(context) }

    LaunchedEffect(channelId, sources) {
        vm.attach(manager)
        vm.play(channelId, sources)
    }

    TvPlayerView(manager)
}
