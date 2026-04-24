package com.streamperf.tv.search

import com.streamperf.tv.models.Channel
import com.streamperf.tv.models.EpgEntry

data class ChannelSearchIndex(
    val id: String,
    val nameTokens: List<String>,
    val epgTokens: List<String>,
    val channelRef: Channel // Kept for quick return
)

fun buildSearchIndex(channels: List<Channel>, epgMap: Map<String, EpgEntry>): List<ChannelSearchIndex> {
    return channels.map { channel ->
        val epg = epgMap[channel.id]
        ChannelSearchIndex(
            id = channel.id,
            nameTokens = channel.name.lowercase().split(Regex("\\s+")),
            epgTokens = epg?.currentTitle?.lowercase()?.split(Regex("\\s+")) ?: emptyList(),
            channelRef = channel
        )
    }
}

fun searchChannelsIndexed(
    query: String,
    index: List<ChannelSearchIndex>
): List<Channel> {

    if (query.isBlank()) return emptyList()

    val q = query.lowercase().trim()

    return index.mapNotNull { item ->
        var score = 0

        // Score 2: Match beginning of a token in channel name
        if (item.nameTokens.any { it.startsWith(q) || it.contains(q) }) score += 2

        // Score 1: Match within EPG title
        if (item.epgTokens.any { it.startsWith(q) || it.contains(q) }) score += 1

        if (score > 0) Pair(item, score) else null
    }
    .sortedByDescending { it.second }
    .map { it.first.channelRef }
    .take(50) // perf guard
}
