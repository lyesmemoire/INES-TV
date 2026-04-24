package com.streamperf.tv

import com.streamperf.tv.models.*
import io.github.jan.supabase.functions.functions
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.ktor.client.call.body
import io.ktor.client.statement.HttpResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * 🛰️ TV REPOSITORY
 * Data orchestration layer with in-memory caching for offline/failure resilience.
 */
class TvRepository(private val authManager: AuthManager) {

    // 💾 LOCAL CACHE (Fallback offline)
    private var cachedChannels: List<Channel> = emptyList()

    // ─── Channels ────────────────────────────────────────────────────────────

    /**
     * 🚀 GET CHANNELS
     * Optimized fetch with local fallback.
     */
    suspend fun getChannels(): List<Channel> {
        return try {
            val remote = fetchChannelsInternal()
            if (remote.isNotEmpty()) {
                cachedChannels = remote
            }
            remote
        } catch (e: Exception) {
            println("Fetch failed, returning cache")
            cachedChannels
        }
    }

    private suspend fun fetchChannelsInternal(): List<Channel> = withContext(Dispatchers.IO) {
        SupabaseManager.client.postgrest["Channel"]
            .select {
                filter { eq("isActive", true) }
            }
            .decodeList<Channel>()
    }

    // LEGACY: Keep for compatibility if needed, but getChannels() is preferred Pro-way
    suspend fun fetchChannels(): List<Channel> = getChannels()

    // ─── Home Feed (AI & Sports) ─────────────────────────────────────────────
    
    suspend fun fetchHomeFeed(): HomeFeedResponse = withContext(Dispatchers.IO) {
        val userId = authManager.getUserId() ?: return@withContext HomeFeedResponse()
        try {
            SupabaseManager.client.functions.invoke(
                function = "tv-os-feed",
                body = buildJsonObject { put("userId", userId) }
            ).body<HomeFeedResponse>()
        } catch (e: Exception) {
            e.printStackTrace()
            HomeFeedResponse()
        }
    }

    // ─── Favorites ───────────────────────────────────────────────────────────

    suspend fun fetchFavoriteChannels(): List<Channel> = withContext(Dispatchers.IO) {
        val userId = authManager.getUserId() ?: return@withContext emptyList()
        try {
            SupabaseManager.client.postgrest["FavoriteChannel"]
                .select(columns = Columns.raw("*, Channel(*)")) {
                    filter { eq("userId", userId) }
                }
                .decodeList<FavoriteChannelRecord>()
                .map { it.channel }
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun addFavorite(channelId: String) = withContext(Dispatchers.IO) {
        val userId = authManager.getUserId() ?: return@withContext
        try {
            SupabaseManager.client.postgrest["FavoriteChannel"]
                .insert(mapOf("userId" to userId, "channelId" to channelId))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun removeFavorite(channelId: String) = withContext(Dispatchers.IO) {
        val userId = authManager.getUserId() ?: return@withContext
        try {
            SupabaseManager.client.postgrest["FavoriteChannel"]
                .delete {
                    filter {
                        eq("userId", userId)
                        eq("channelId", channelId)
                    }
                }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // ─── EPG ─────────────────────────────────────────────────────────────────

    suspend fun fetchEpgForChannels(channelIds: List<String>): Map<String, EpgEntry> =
        withContext(Dispatchers.IO) {
            if (channelIds.isEmpty()) return@withContext emptyMap()
            try {
                val programs = SupabaseManager.client.postgrest["epg_programs"]
                    .select {
                        filter {
                            isIn("channelId", channelIds)
                            gte("endTime", "now()")
                            lte("startTime", "now() + interval '12 hours'")
                        }
                    }
                    .decodeList<EpgProgram>()

                programs.groupBy { it.channelId }.mapValues { (_, progs) ->
                    val sorted = progs.sortedBy { it.startTime }
                    val current = sorted.firstOrNull()
                    val next = if (sorted.size > 1) sorted[1] else null

                    EpgEntry(
                        channelId = current?.channelId ?: "",
                        currentTitle = current?.title ?: "Programme indisponible",
                        nextTitle = next?.title,
                        startTime = current?.startTime ?: "",
                        endTime = current?.endTime ?: ""
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
                emptyMap()
            }
        }

    // ─── History ─────────────────────────────────────────────────────────────

    suspend fun fetchHistory(channelId: String): Int = withContext(Dispatchers.IO) {
        val userId = authManager.getUserId() ?: return@withContext 0
        try {
            val record = SupabaseManager.client.postgrest["WatchHistory"]
                .select {
                    filter {
                        eq("userId", userId)
                        eq("channelId", channelId)
                    }
                }
                .decodeSingleOrNull<Map<String, Int>>()
            record?.get("lastPosition") ?: 0
        } catch (e: Exception) {
            e.printStackTrace()
            0
        }
    }

    suspend fun recordHistory(channelId: String, category: String? = null, lastPosition: Int = 0) =
        withContext(Dispatchers.IO) {
            val userId = authManager.getUserId() ?: return@withContext
            try {
                SupabaseManager.client.postgrest["watch_events"]
                    .insert(
                        mapOf(
                            "user_id" to userId,
                            "channel_id" to channelId,
                            "category" to category,
                            "watch_duration" to 1
                        )
                    )

                SupabaseManager.client.postgrest["WatchHistory"]
                    .upsert(
                        mapOf(
                            "userId" to userId,
                            "channelId" to channelId,
                            "lastPosition" to lastPosition,
                            "watchedAt" to System.currentTimeMillis().toString()
                        )
                    )
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
}
