package com.streamperf.tv.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.streamperf.tv.models.SportsEvent

@Composable
fun LiveMatchCard(
    match: SportsEvent,
    onClick: () -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (isFocused) 1.05f else 1.0f)
    
    val infiniteTransition = rememberInfiniteTransition()
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse)
    )

    Box(
        modifier = Modifier
            .width(360.dp)
            .height(180.dp)
            .scale(scale)
            .onFocusChanged { isFocused = it.isFocused }
            .clickable { onClick() }
            .background(
                brush = Brush.verticalGradient(listOf(Color(0xFF1E1E2C), Color(0xFF0F0F1B))),
                shape = RoundedCornerShape(24.dp)
            )
            .border(
                width = if (isFocused) 3.dp else 1.dp,
                color = if (isFocused) Color(0xFF6366F1) else Color.White.copy(alpha = 0.05f),
                shape = RoundedCornerShape(24.dp)
            )
            .padding(24.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.background(Color(0xFFEF4444), RoundedCornerShape(4.dp)).padding(horizontal = 8.dp, vertical = 2.dp)) {
                    Text("LIVE", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Black, modifier = Modifier.scale(pulseAlpha))
                }
                Spacer(Modifier.width(12.dp))
                Text(match.competition.uppercase(), color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Spacer(Modifier.weight(1f))
                Text(match.match_time, color = Color(0xFF6366F1), fontSize = 14.sp, fontWeight = FontWeight.Black)
            }

            Spacer(Modifier.weight(1f))

            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                // Home Team
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                    AsyncImage(model = match.home_logo, contentDescription = null, modifier = Modifier.size(48.dp))
                    Text(match.home_team, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                }

                // Score
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center, modifier = Modifier.padding(horizontal = 16.dp)) {
                    Text(match.score_home.toString(), color = Color.White, fontSize = 42.sp, fontWeight = FontWeight.Black)
                    Text("-", color = Color.Gray, fontSize = 24.sp, modifier = Modifier.padding(horizontal = 12.dp))
                    Text(match.score_away.toString(), color = Color.White, fontSize = 42.sp, fontWeight = FontWeight.Black)
                }

                // Away Team
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                    AsyncImage(model = match.away_logo, contentDescription = null, modifier = Modifier.size(48.dp))
                    Text(match.away_team, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                }
            }
            
            Spacer(Modifier.weight(1f))
            
            Text(
               text = "WATCH ON ${match.channels?.name ?: "IPTV SIGNAL"}",
               color = if (isFocused) Color.White else Color.Gray,
               fontSize = 11.sp,
               fontWeight = FontWeight.Bold,
               modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}
