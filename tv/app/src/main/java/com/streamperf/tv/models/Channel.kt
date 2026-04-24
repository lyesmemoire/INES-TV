package com.streamperf.tv.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import androidx.compose.runtime.Stable

@Stable
@Serializable
data class TimelineEvent(
    val time: String,
    val description: String
)

@Stable
@Serializable
data class LiveStats(
    @SerialName("elapsed_time")
    val elapsedTime: String,
    @SerialName("key_players")
    val keyPlayers: List<String>,
    @SerialName("upcoming_events")
    val upcomingEvents: List<TimelineEvent>
)

@Stable
@Serializable
data class Channel(
    val id: String,
    val name: String,
    val category: String,
    val viewers: String = "0",
    val thumbnail: String? = null,
    @SerialName("stream_url")
    val streamUrl: String,
    @SerialName("is_active")
    val isActive: Boolean = true,

    // Sports Specific
    val score: String? = null,
    @SerialName("home_logo")
    val homeLogo: String? = null,
    @SerialName("away_logo")
    val awayLogo: String? = null,
    @SerialName("home_name")
    val homeName: String? = null,
    @SerialName("away_name")
    val awayName: String? = null,
    val league: String? = null,
    @SerialName("match_time")
    val matchTime: String? = null,
    val status: String? = "OFFLINE", // "LIVE", "UPCOMING", "OFFLINE"
    @SerialName("live_stats")
    val liveStats: LiveStats? = null,
    val isFavorite: Boolean = false
)

// Mock data for offline/demo use
fun getMockChannels(): List<Channel> {
    return listOf(
        Channel(
            id = "fox-sports",
            name = "Fox Sports 1",
            category = "Basketball",
            viewers = "24.5K",
            thumbnail = "https://picsum.photos/seed/fox/600/340",
            streamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            score = "98 - 102",
            homeLogo = "https://picsum.photos/seed/lakers/100/100",
            awayLogo = "https://picsum.photos/seed/warriors/100/100",
            homeName = "Lakers",
            awayName = "Warriors",
            league = "NBA",
            matchTime = "Q4 01:12",
            status = "LIVE",
            liveStats = LiveStats(
                elapsedTime = "Q4 01:12",
                keyPlayers = listOf("LeBron James", "Stephen Curry"),
                upcomingEvents = listOf(
                    TimelineEvent("Q3", "Warriors +12 run"),
                    TimelineEvent("Q4", "Timeout Lakers")
                )
            )
        ),
        Channel(
            id = "bein-1",
            name = "beIN SPORTS 1",
            category = "Football",
            viewers = "112K",
            thumbnail = "https://picsum.photos/seed/bein/600/340",
            streamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            score = "2 - 1",
            homeLogo = "https://picsum.photos/seed/teamA/100/100",
            awayLogo = "https://picsum.photos/seed/teamB/100/100",
            homeName = "Real Madrid",
            awayName = "Barcelona",
            league = "La Liga",
            matchTime = "68'",
            status = "LIVE",
            liveStats = LiveStats(
                elapsedTime = "68'",
                keyPlayers = listOf("Mbappe", "Bellingham"),
                upcomingEvents = listOf(
                    TimelineEvent("45'", "Goal by Madrid"),
                    TimelineEvent("60'", "Yellow Card Barca")
                )
            )
        ),
        Channel(
            id = "canal-plus",
            name = "Canal+ Sport",
            category = "Formula 1",
            viewers = "89K",
            thumbnail = "https://picsum.photos/seed/canal/600/340",
            streamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        )
    )
}
