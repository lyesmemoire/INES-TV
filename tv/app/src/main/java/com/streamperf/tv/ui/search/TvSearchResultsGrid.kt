package com.streamperf.tv.ui.search

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.tv.foundation.lazy.grid.TvGridCells
import androidx.tv.foundation.lazy.grid.TvLazyVerticalGrid
import androidx.tv.foundation.lazy.grid.itemsIndexed
import androidx.tv.foundation.lazy.grid.rememberTvLazyGridState
import coil.imageLoader
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.streamperf.tv.models.Channel
import com.streamperf.tv.models.EpgEntry
import com.streamperf.tv.ui.ChannelCard
import kotlinx.coroutines.launch

@Composable
fun TvSearchResultsGrid(
    channels: List<Channel>,
    favoritesSet: Set<String>,
    epg: Map<String, EpgEntry>,
    onClick: (Channel, Int) -> Unit,
    onToggleFavorite: (String) -> Unit
) {
    val gridState = rememberTvLazyGridState()
    val context = LocalContext.current

    // Scroll-based intelligent prefetching (Netflix-style)
    val firstVisibleItemIndex by remember { derivedStateOf { gridState.firstVisibleItemIndex } }
    
    LaunchedEffect(firstVisibleItemIndex, channels) {
        val nextBatch = channels
            .drop(firstVisibleItemIndex)
            .take(15)
            .mapNotNull { it.thumbnail }

        nextBatch.forEach { url ->
            val request = ImageRequest.Builder(context)
                .data(url)
                .allowHardware(false)
                .memoryCachePolicy(CachePolicy.ENABLED)
                .diskCachePolicy(CachePolicy.ENABLED)
                .build()
            context.imageLoader.enqueue(request)
        }
    }

    TvLazyVerticalGrid(
        columns = TvGridCells.Fixed(3),
        modifier = Modifier.fillMaxSize(),
        state = gridState,
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        itemsIndexed(items = channels, key = { _, ch -> ch.id }) { index, channel ->
            ChannelCard(
                channel = channel,
                program = epg[channel.id],
                isFavorite = favoritesSet.contains(channel.id),
                onClick = { onClick(channel, index) },
                onLongClick = { onToggleFavorite(channel.id) }
            )
        }
    }
}
