package com.streamperf.tv.models

import kotlinx.serialization.Serializable

@Serializable
data class HomeFeedResponse(
    val liveSports: List<SportsEvent> = emptyList(),
    val predictiveEvents: List<PredictiveEvent> = emptyList(),
    val personalized: List<Channel> = emptyList(),
    val trending: List<Channel> = emptyList()
)
