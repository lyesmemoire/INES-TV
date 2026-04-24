package com.streamperf.tv.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class EpgProgram(
    val id: String,
    @SerialName("channel_id")
    val channelId: String,
    val title: String,
    @SerialName("start_time")
    val startTime: String,
    @SerialName("end_time")
    val endTime: String,
    val description: String? = null
)
