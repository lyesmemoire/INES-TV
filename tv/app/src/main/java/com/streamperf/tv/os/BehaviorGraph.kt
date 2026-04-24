package com.streamperf.tv.os

import kotlinx.serialization.Serializable

@Serializable
data class ChannelNode(
    val channelId: String,
    val weight: Float,
    val lastWatched: Long,
    val avgWatchTime: Long
)

@Serializable
data class BehaviorGraph(
    val nodes: MutableMap<String, ChannelNode> = mutableMapOf()
)
