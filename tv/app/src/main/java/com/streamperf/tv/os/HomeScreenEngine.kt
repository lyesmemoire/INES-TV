package com.streamperf.tv.os

import com.streamperf.tv.models.Channel

data class HomeSection(
    val title: String,
    val channels: List<Channel>
)

class HomeScreenEngine(
    private val ai: AIRecommendationEngine,
    private val graph: BehaviorGraph
) {

    fun generate(channels: List<Channel>): List<HomeSection> {
        val recommended = ai.recommend(channels).take(12)
        val trending = channels.shuffled().take(12) // Simulated Live Trending Data

        val continueWatching = graph.nodes.values
            .sortedByDescending { it.lastWatched }
            .take(12)
            .mapNotNull { node -> channels.find { it.id == node.channelId } }

        val rootSections = mutableListOf<HomeSection>()
        
        if (continueWatching.isNotEmpty()) {
            rootSections.add(HomeSection("Continue Watching", continueWatching))
        }
        
        if (recommended.isNotEmpty()) {
            rootSections.add(HomeSection("Recommended For You", recommended))
        }
        
        if (trending.isNotEmpty()) {
            rootSections.add(HomeSection("Trending Live", trending))
        }
        
        return rootSections
    }
}
