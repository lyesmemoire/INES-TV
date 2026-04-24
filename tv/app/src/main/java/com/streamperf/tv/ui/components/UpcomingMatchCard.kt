package com.streamperf.tv.ui.components

import androidx.compose.animation.core.animateFloatAsState
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.streamperf.tv.models.SportsEvent

@Composable
fun UpcomingMatchCard(
    match: SportsEvent,
    onClick: () -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (isFocused) 1.05f else 1.0f)

    Box(
        modifier = Modifier
            .width(280.dp)
            .height(140.dp)
            .scale(scale)
            .onFocusChanged { isFocused = it.isFocused }
            .clickable { onClick() }
            .background(Color(0xFF16161C), RoundedCornerShape(20.dp))
            .border(
                width = if (isFocused) 2.dp else 1.dp,
                color = if (isFocused) Color(0xFF6366F1) else Color.White.copy(alpha = 0.05f),
                shape = RoundedCornerShape(20.dp)
            )
            .padding(20.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(match.competition.uppercase(), color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                Spacer(Modifier.weight(1f))
                 Text("BIENTÔT", color = Color(0xFFFBBF24), fontSize = 10.sp, fontWeight = FontWeight.Black)
            }

            Spacer(Modifier.weight(1f))

            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(model = match.home_logo, contentDescription = null, modifier = Modifier.size(32.dp))
                Text(" vs ", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp))
                AsyncImage(model = match.away_logo, contentDescription = null, modifier = Modifier.size(32.dp))
                
                Spacer(Modifier.weight(1f))
                
                Text(
                    text = match.start_time.split("T").lastOrNull()?.take(5) ?: "??:??", 
                    color = Color.White, 
                    fontSize = 18.sp, 
                    fontWeight = FontWeight.Black
                )
            }
            
            Spacer(Modifier.weight(1f))
            
            Text(
                text = "${match.home_team} - ${match.away_team}",
                color = Color.White.copy(alpha = 0.6f),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1
            )
        }
    }
}
