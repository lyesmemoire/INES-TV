package com.streamperf.tv.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class FavoriteChannelRecord(
    val id: String,
    @SerialName("user_id")
    val userId: String,
    @SerialName("channel_id")
    val channelId: String,
    @SerialName("Channel")
    val channel: Channel
)
