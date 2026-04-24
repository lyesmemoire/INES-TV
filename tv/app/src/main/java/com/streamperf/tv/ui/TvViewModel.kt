package com.streamperf.tv.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.streamperf.tv.TvRepository
import com.streamperf.tv.data.FavoritesManager
import com.streamperf.tv.models.*
import com.streamperf.tv.search.ChannelSearchIndex
import com.streamperf.tv.search.buildSearchIndex
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed class CatalogUiState {
    object Loading : CatalogUiState()
    data class Loaded(
        val channels: List<Channel> = emptyList(),
        val categories: List<String> = emptyList(),
        val epg: Map<String, EpgEntry> = emptyMap(),
        val searchIndex: List<ChannelSearchIndex> = emptyList(),
        val homeFeed: HomeFeedResponse = HomeFeedResponse()
    ) : CatalogUiState()
    data class Error(val message: String) : CatalogUiState()
}

/**
 * 🚀 TV VIEW MODEL
 * Manages state for the Catalog screen, including AI Home Feed and Realtime updates.
 */
class TvViewModel(
    private val repository: TvRepository,
    private val favoritesManager: FavoritesManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<CatalogUiState>(CatalogUiState.Loading)
    val uiState: StateFlow<CatalogUiState> = _uiState.asStateFlow()

    init {
        refreshCatalog()
    }

    fun refreshCatalog() {
        viewModelScope.launch {
            _uiState.value = CatalogUiState.Loading
            try {
                val channels = repository.fetchChannels()
                val homeFeed = repository.fetchHomeFeed()
                val categories = channels.map { it.category }.distinct().sorted()
                val epg = repository.fetchEpgForChannels(channels.map { it.id })
                val searchIndex = buildSearchIndex(channels, epg)

                _uiState.value = CatalogUiState.Loaded(
                    channels = channels,
                    categories = categories,
                    epg = epg,
                    searchIndex = searchIndex,
                    homeFeed = homeFeed
                )
            } catch (e: Exception) {
                _uiState.value = CatalogUiState.Error(e.localizedMessage ?: "Failed to load catalog")
            }
        }
    }

    fun toggleFavorite(channelId: String) {
        viewModelScope.launch {
            favoritesManager.toggleFavorite(channelId)
        }
    }
}
