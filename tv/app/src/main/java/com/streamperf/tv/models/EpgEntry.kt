package com.streamperf.tv.models

import androidx.compose.runtime.Stable

@Stable
data class EpgEntry(
    val channelId: String,
    val currentTitle: String,
    val nextTitle: String?,
    val startTime: String,
    val endTime: String
)
