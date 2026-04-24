package com.streamperf.tv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.foundation.lazy.list.TvLazyColumn
import androidx.tv.foundation.lazy.list.TvLazyRow
import androidx.tv.foundation.lazy.list.items
import androidx.tv.material3.*
import coil.compose.AsyncImage
import com.streamperf.tv.models.Channel

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun TvSportsDashboard(
    channels: List<Channel>,
    onChannelSelected: (Channel) -> Unit,
    isLoading: Boolean = false,
    isFavorite: (Channel) -> Boolean = { false },
    onToggleFavorite: (Channel) -> Unit = {}
) {
    val sportsChannels = channels.filter {
        it.category == "Football" || it.category == "Basketball" || it.homeName != null
    }

    val liveMatches = sportsChannels.filter { it.status == "LIVE" || it.score != null }
    val featuredMatch = liveMatches.firstOrNull() ?: sportsChannels.firstOrNull()

    if (!isLoading && featuredMatch == null) return

    Box(modifier = Modifier.fillMaxSize()) {

        // Background hero — only when data is loaded
        if (!isLoading && featuredMatch != null) {
            AsyncImage(
                model = featuredMatch.thumbnail,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                alpha = 0.3f
            )
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color(0xFF09090B)),
                        startY = 200f
                    )
                )
        )

        TvLazyColumn(
            contentPadding = PaddingValues(top = 40.dp, bottom = 40.dp, start = 50.dp, end = 50.dp),
            verticalArrangement = Arrangement.spacedBy(40.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            item {
                if (isLoading) {
                    SkeletonHeroSection()
                } else if (featuredMatch != null) {
                    HeroMatchSection(
                        featuredMatch = featuredMatch,
                        onChannelSelected = onChannelSelected,
                        isFavorite = isFavorite(featuredMatch),
                        onToggleFavorite = { onToggleFavorite(featuredMatch) }
                    )
                }
            }

            if (!isLoading && liveMatches.size > 1) {
                item {
                    Text(
                        text = "Coups d'envoi",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    TvLazyRow(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                        items(liveMatches.filter { it.id != featuredMatch?.id }) { channel ->
                            ChannelCard(channel = channel, onClick = { onChannelSelected(channel) })
                        }
                    }
                }
            }

            if (isLoading) {
                item { SkeletonChannelRow() }
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun HeroMatchSection(
    featuredMatch: Channel,
    onChannelSelected: (Channel) -> Unit,
    isFavorite: Boolean = false,
    onToggleFavorite: () -> Unit = {}
) {
    Column(modifier = Modifier.padding(top = 20.dp, bottom = 20.dp)) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.padding(bottom = 24.dp)
        ) {
            Box(
                modifier = Modifier
                    .background(Color(0x33FFFFFF), androidx.compose.foundation.shape.RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = featuredMatch.league ?: "FEATURED",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            if (featuredMatch.status == "LIVE") {
                Box(
                    modifier = Modifier
                        .background(Color(0x33EF4444), androidx.compose.foundation.shape.RoundedCornerShape(8.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(Color(0xFFEF4444), androidx.compose.foundation.shape.CircleShape)
                        )
                        Text(text = "EN DIRECT", color = Color(0xFFF87171), fontSize = 12.sp, fontWeight = FontWeight.Black)
                    }
                }
            }

        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(40.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                AsyncImage(
                    model = featuredMatch.homeLogo ?: featuredMatch.thumbnail,
                    contentDescription = featuredMatch.homeName,
                    modifier = Modifier.size(100.dp),
                    contentScale = ContentScale.Fit
                )
                Text(
                    text = featuredMatch.homeName ?: "Home",
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = featuredMatch.score ?: "VS",
                    color = Color.White,
                    fontSize = 64.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = featuredMatch.matchTime ?: "À venir",
                    color = Color(0xFF34D399),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                AsyncImage(
                    model = featuredMatch.awayLogo ?: featuredMatch.thumbnail,
                    contentDescription = featuredMatch.awayName,
                    modifier = Modifier.size(100.dp),
                    contentScale = ContentScale.Fit
                )
                Text(
                    text = featuredMatch.awayName ?: "Away",
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Button(
                onClick = { onChannelSelected(featuredMatch) }
            ) {
                Text(
                    text = "REGARDER LE MATCH",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
            
            Button(
                onClick = onToggleFavorite
            ) {
                Text(
                    text = if (isFavorite) "♥ RETIRER DES FAVORIS" else "♡ AJOUTER AUX FAVORIS",
                    color = if (isFavorite) Color(0xFFEF4444) else Color(0xFFA1A1AA),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
private fun ChannelCard(channel: Channel, onClick: () -> Unit) {
    var isFocused by remember { mutableStateOf(false) }
    Card(
        onClick = onClick,
        modifier = Modifier
            .width(200.dp)
            .height(112.dp)
            .onFocusChanged { isFocused = it.isFocused },
        shape = CardDefaults.shape(androidx.compose.foundation.shape.RoundedCornerShape(8.dp)),
        colors = CardDefaults.colors(containerColor = Color(0xFF111827)),
        border = CardDefaults.border(
            focusedBorder = Border(androidx.compose.foundation.BorderStroke(2.dp, Color(0xFF6366F1)))
        )
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = channel.thumbnail,
                contentDescription = channel.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            Box(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black)))
                    .padding(8.dp)
            ) {
                Text(
                    text = channel.name,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1
                )
            }
        }
    }
}
