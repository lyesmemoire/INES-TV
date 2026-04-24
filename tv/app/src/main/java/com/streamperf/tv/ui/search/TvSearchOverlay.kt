package com.streamperf.tv.ui.search

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.streamperf.tv.models.Channel
import com.streamperf.tv.models.EpgEntry
import com.streamperf.tv.search.ChannelSearchIndex
import com.streamperf.tv.search.searchChannelsIndexed

@Composable
fun TvSearchOverlay(
    channels: List<Channel>,
    searchIndex: List<ChannelSearchIndex>,
    favoritesSet: Set<String>,
    epg: Map<String, EpgEntry>,
    onResultClick: (Channel, Int, List<Channel>) -> Unit,
    onToggleFavorite: (String) -> Unit
) {
    var query by remember { mutableStateOf("") }
    
    val results = remember(query, searchIndex) {
        if (query.isEmpty()) emptyList() else searchChannelsIndexed(query, searchIndex)
    }

    fun handleKey(key: String) {
        when (key) {
            "⌫" -> if (query.isNotEmpty()) query = query.dropLast(1)
            "ESPACE" -> query += " "
            "OK" -> {}
            else -> query += key
        }
    }

    Row(modifier = Modifier
        .fillMaxSize()
        .background(Color(0xDD000000))
        .padding(24.dp)
    ) {
        // 🔤 Search Bar + Keyboard
        Column(modifier = Modifier.weight(0.35f)) {
            // Search Bar Text
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF161B2A), RoundedCornerShape(8.dp))
                    .border(2.dp, Color(0xFF6366F1), RoundedCornerShape(8.dp))
                    .padding(16.dp)
            ) {
                Text(
                    text = if (query.isEmpty()) "Chercher chaîne..." else "$query|",
                    color = if (query.isNotEmpty()) Color.White else Color.Gray,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(24.dp))

            TvSearchKeyboard(onKeyPress = { handleKey(it) })
        }

        // 📺 Results Grid
        Column(modifier = Modifier.weight(0.65f).padding(start = 24.dp)) {
            Text(
                text = if (query.isBlank()) "Appuyez sur une lettre..." else "${results.size} résultats trouvés",
                color = Color.Gray,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            TvSearchResultsGrid(
                channels = results,
                favoritesSet = favoritesSet,
                epg = epg,
                onClick = { c, i -> onResultClick(c, i, results) },
                onToggleFavorite = onToggleFavorite
            )
        }
    }
}
