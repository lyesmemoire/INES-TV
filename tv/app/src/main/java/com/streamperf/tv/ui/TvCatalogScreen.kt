package com.streamperf.tv.ui

import android.view.KeyEvent
import androidx.compose.animation.*
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.foundation.lazy.grid.TvGridCells
import androidx.tv.foundation.lazy.grid.TvLazyVerticalGrid
import androidx.tv.foundation.lazy.grid.itemsIndexed
import androidx.tv.foundation.lazy.grid.rememberTvLazyGridState
import androidx.tv.foundation.lazy.list.TvLazyColumn
import androidx.tv.foundation.lazy.list.TvLazyRow
import androidx.tv.foundation.lazy.list.itemsIndexed
import androidx.tv.material3.*
import coil.compose.AsyncImage
import com.streamperf.tv.AuthManager
import com.streamperf.tv.TvRepository
import com.streamperf.tv.data.FavoritesManager
import com.streamperf.tv.models.Channel
import com.streamperf.tv.models.EpgEntry
import com.streamperf.tv.os.AITVOSOrchestrator
import com.streamperf.tv.player.ExoPlayerScreen
import com.streamperf.tv.ui.components.LiveMatchCard
import com.streamperf.tv.ui.search.TvSearchOverlay
import kotlinx.coroutines.launch

/**
 * 📺 TV CATALOG SCREEN
 * Main discovery interface with state hoisting and AI-powered recommendations.
 */
@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun TvCatalogScreen(
    viewModel: TvViewModel,
    authManager: AuthManager, 
    repository: TvRepository, 
    favoritesManager: FavoritesManager
) {
    val uiState by viewModel.uiState.collectAsState()
    
    var startIndex by remember { mutableStateOf(0) }
    var selectedChannel by remember { mutableStateOf<Channel?>(null) }
    var fullChannelsList by remember { mutableStateOf<List<Channel>>(emptyList()) }
    var showSearch by remember { mutableStateOf(false) }

    val favoritesSet by favoritesManager.favoritesFlow.collectAsState(initial = emptySet())
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    val aiOS = remember { AITVOSOrchestrator(context) }
    
    DisposableEffect(Unit) {
        onDispose { aiOS.shutdown() }
    }

    if (selectedChannel != null) {
        ExoPlayerScreen(
            channels = fullChannelsList,
            startIndex = startIndex,
            onBack = { selectedChannel = null },
            repository = repository,
            aiOS = aiOS
        )
        return
    }

    Box(modifier = Modifier
        .fillMaxSize()
        .background(Color(0xFF0B0F19))
        .onPreviewKeyEvent { event ->
            if (event.type == KeyEventType.KeyDown) {
                if (event.nativeKeyEvent.keyCode == KeyEvent.KEYCODE_SEARCH) {
                    showSearch = true; true
                } else if (event.nativeKeyEvent.keyCode == KeyEvent.KEYCODE_BACK && showSearch) {
                    showSearch = false; true
                } else false
            } else false
        }
    ) {
        when (val state = uiState) {
            is CatalogUiState.Loading -> CircularProgressIndicator(Modifier.align(Alignment.Center), color = Color(0xFF6366F1))
            is CatalogUiState.Error -> Text(state.message, color = Color.White, modifier = Modifier.align(Alignment.Center))
            is CatalogUiState.Loaded -> {
                TvCatalogLayout(
                    state = state,
                    favoritesSet = favoritesSet,
                    favoritesManager = favoritesManager,
                    aiOS = aiOS,
                    onOpenSearch = { showSearch = true },
                    onChannelSelected = { channel, index, list -> 
                        fullChannelsList = list; startIndex = index; selectedChannel = channel 
                    }
                )

                if (showSearch) {
                    TvSearchOverlay(
                        channels = state.channels, 
                        searchIndex = state.searchIndex, 
                        favoritesSet = favoritesSet, 
                        epg = state.epg,
                        onResultClick = { channel, index, list -> 
                            showSearch = false; fullChannelsList = list; startIndex = index; selectedChannel = channel 
                        },
                        onToggleFavorite = { channelId -> viewModel.toggleFavorite(channelId) }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun TvCatalogLayout(
    state: CatalogUiState.Loaded,
    favoritesSet: Set<String>,
    favoritesManager: FavoritesManager,
    aiOS: AITVOSOrchestrator,
    onOpenSearch: () -> Unit,
    onChannelSelected: (Channel, Int, List<Channel>) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val gridState = rememberTvLazyGridState()

    val categories = remember(state.categories) {
        listOf("RECHERCHE", "ACCUEIL", "FAVORIS") + state.categories.map { it.uppercase() }
    }

    var selectedCategory by remember { mutableStateOf("ACCUEIL") }
    var focusedCategoryIndex by remember { mutableStateOf(1) } // Default to "ACCUEIL"

    val filteredChannels = remember(selectedCategory, state.channels, favoritesSet) {
        when (selectedCategory) {
            "ACCUEIL", "TOUT" -> state.channels
            "FAVORIS" -> state.channels.filter { favoritesSet.contains(it.id) }
            "RECHERCHE" -> emptyList()
            else -> state.channels.filter { it.category.uppercase() == selectedCategory }
        }
    }

    Row(modifier = Modifier.fillMaxSize()) {
        // 🟣 SIDEBAR
        Column(modifier = Modifier.width(260.dp).fillMaxHeight().background(Color(0xFF0B0B0F)).padding(top = 40.dp)) {
            Text("STREAMPERF", color = Color(0xFF6366F1), fontSize = 24.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, modifier = Modifier.padding(start = 24.dp, bottom = 40.dp))

            TvLazyColumn(contentPadding = PaddingValues(bottom = 40.dp)) {
                itemsIndexed(categories) { index, category ->
                    val isFocused = index == focusedCategoryIndex
                    
                    Text(
                        text = category, fontSize = 16.sp, fontWeight = if (isFocused || category == selectedCategory) FontWeight.Bold else FontWeight.Normal,
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp, horizontal = 12.dp)
                            .onFocusChanged {
                                if (it.isFocused) {
                                    focusedCategoryIndex = index
                                    selectedCategory = category
                                    if (category == "RECHERCHE") {
                                        onOpenSearch()
                                        selectedCategory = "ACCUEIL" 
                                        focusedCategoryIndex = 1
                                    }
                                }
                            }
                            .focusable().background(if (selectedCategory == category) Color(0xFF6366F1).copy(alpha = 0.15f) else Color.Transparent, RoundedCornerShape(8.dp))
                            .padding(horizontal = 12.dp, vertical = 12.dp),
                        color = if (isFocused) Color.White else if (selectedCategory == category) Color(0xFF6366F1) else if (category == "RECHERCHE") Color(0xFFFBBF24) else Color.Gray
                    )
                }
            }
        }

        // 🔵 NORMAL CATALOG VIEW
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text(selectedCategory, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 8.dp, bottom = 16.dp))

            if (selectedCategory == "ACCUEIL") {
                // OS V5 HYBRID DYNAMIC SECTIONS
                val sections = remember(state.channels) { aiOS.buildHome(state.channels) }
                
                TvLazyColumn(
                    contentPadding = PaddingValues(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(28.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    // 🔴 SPORTS HERO LAYER (LIVE)
                    if (state.homeFeed.liveSports.isNotEmpty()) {
                        item {
                            Text("EN DIRECT - SPORTS", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(start = 8.dp, bottom = 12.dp))
                            TvLazyRow(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                                itemsIndexed(state.homeFeed.liveSports) { _, match ->
                                    LiveMatchCard(
                                        match = match,
                                        onClick = { 
                                            match.channels?.let { ch -> 
                                               onChannelSelected(ch, 0, listOf(ch))
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }

                    // ▶ CONTINUE WATCHING LAYER
                    val continueWatching = sections.find { it.title.contains("REPRENDRE") }
                    continueWatching?.let { section ->
                        item {
                            Text("▶ REPRENDRE LA LECTURE", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 8.dp, bottom = 12.dp))
                            TvLazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                itemsIndexed(section.channels, key = { _, ch -> ch.id }) { index, channel ->
                                    Box(modifier = Modifier.width(220.dp)) {
                                        ChannelCard(
                                            channel = channel, 
                                            program = state.epg[channel.id], 
                                            isFavorite = favoritesSet.contains(channel.id),
                                            onClick = { onChannelSelected(channel, index, section.channels) },
                                            onLongClick = { coroutineScope.launch { favoritesManager.toggleFavorite(channel.id) } }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // 📺 FOR YOU
                    if (state.homeFeed.personalized.isNotEmpty()) {
                        item {
                            Text("📺 POUR VOUS (AI RANKED)", color = Color(0xFF6366F1), fontSize = 20.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(start = 8.dp, bottom = 12.dp))
                            TvLazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                itemsIndexed(state.homeFeed.personalized, key = { _, ch -> ch.id }) { index, channel ->
                                    Box(modifier = Modifier.width(220.dp)) {
                                        ChannelCard(
                                            channel = channel, 
                                            program = state.epg[channel.id], 
                                            isFavorite = favoritesSet.contains(channel.id),
                                            onClick = { onChannelSelected(channel, index, state.homeFeed.personalized) },
                                            onLongClick = { coroutineScope.launch { favoritesManager.toggleFavorite(channel.id) } }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // 📦 CATALOG CATEGORIES
                    itemsIndexed(sections.filterNot { it.title.contains("REPRENDRE") }) { _, section ->
                        Text(section.title, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 8.dp, bottom = 12.dp))
                        TvLazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            itemsIndexed(section.channels, key = { _, ch -> ch.id }) { index, channel ->
                                Box(modifier = Modifier.width(220.dp)) {
                                    ChannelCard(
                                        channel = channel, 
                                        program = state.epg[channel.id], 
                                        isFavorite = favoritesSet.contains(channel.id),
                                        onClick = { onChannelSelected(channel, index, section.channels) },
                                        onLongClick = { coroutineScope.launch { favoritesManager.toggleFavorite(channel.id) } }
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                TvLazyVerticalGrid(
                    columns = TvGridCells.Fixed(4), 
                    modifier = Modifier.fillMaxSize(), 
                    state = gridState,
                    contentPadding = PaddingValues(8.dp), 
                    horizontalArrangement = Arrangement.spacedBy(16.dp), 
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    itemsIndexed(items = filteredChannels, key = { _, ch -> ch.id }) { index, channel ->
                        ChannelCard(
                            channel = channel, 
                            program = state.epg[channel.id], 
                            isFavorite = favoritesSet.contains(channel.id),
                            onClick = { onChannelSelected(channel, index, filteredChannels) },
                            onLongClick = { coroutineScope.launch { favoritesManager.toggleFavorite(channel.id) } }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun ChannelCard(
    channel: Channel, 
    program: EpgEntry?, 
    isFavorite: Boolean, 
    onClick: () -> Unit, 
    onLongClick: () -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (isFocused) 1.08f else 1.0f, animationSpec = tween(200))

    Card(
        onClick = onClick,
        modifier = Modifier
            .height(130.dp)
            .scale(scale)
            .shadow(if (isFocused) 12.dp else 0.dp, spotColor = Color(0xFF6366F1))
            .onFocusChanged { isFocused = it.isFocused },
        shape = CardDefaults.shape(RoundedCornerShape(12.dp)),
        colors = CardDefaults.colors(
            containerColor = Color(0xFF161B2A), 
            focusedContainerColor = Color(0xFF161B2A)
        ),
        border = CardDefaults.border(
            focusedBorder = Border(
                androidx.compose.foundation.BorderStroke(2.dp, Color(0xFF6366F1))
            )
        )
    ) {
        Box(modifier = Modifier.fillMaxSize().combinedClickable(onClick = onClick, onLongClick = onLongClick)) {
            AsyncImage(
                model = channel.thumbnail, 
                contentDescription = null, 
                modifier = Modifier.fillMaxSize(), 
                contentScale = ContentScale.Crop, 
                alpha = 0.5f
            )
            Column(modifier = Modifier.align(Alignment.BottomStart).padding(12.dp)) {
                Text(channel.name, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                if (program != null) {
                    Text(
                        text = program.currentTitle, 
                        color = Color(0xFF6366F1), 
                        fontSize = 11.sp, 
                        fontWeight = FontWeight.Medium, 
                        maxLines = 1
                    )
                }
            }
            if (isFavorite) {
                Text(
                    text = "★", 
                    color = Color(0xFFFBBF24), 
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(10.dp)
                        .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp), 
                    fontSize = 14.sp
                )
            }
            if (channel.status == "LIVE") {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .background(Color(0xFFEF4444), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text("LIVE", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Black)
                }
            }
        }
    }
}
