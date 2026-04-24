package com.streamperf.tv.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.streamperf.tv.models.IntelligenceEvent
import com.streamperf.tv.models.SportsEvent
import kotlinx.coroutines.delay

/**
 * ⚡ SMART ZAP PROMPT (TV Overlay)
 * Interactive notification that allows zapping to a high-momentum event on another channel.
 */
@Composable
fun SmartZapPrompt(
    event: IntelligenceEvent,
    match: SportsEvent,
    onAccept: () -> Unit,
    onDismiss: () -> Unit
) {
    var visible by remember { mutableStateOf(false) }

    LaunchedEffect(event) {
        visible = true
        delay(10000) // Show for 10s
        visible = false
        delay(500)
        onDismiss()
    }

    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomEnd) {
        AnimatedVisibility(
            visible = visible,
            enter = slideInHorizontally { it } + fadeIn(),
            exit = slideOutHorizontally { it } + fadeOut(),
            modifier = Modifier.padding(32.dp)
        ) {
            Column(
                modifier = Modifier
                    .width(320.dp)
                    .background(Color(0xFF111115), RoundedCornerShape(24.dp))
                    .padding(24.dp)
            ) {
                Text(
                    text = "MOMENT FORT DÉTECTÉ",
                    color = Color(0xFF6366F1),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "${event.type}: ${event.data["team"] ?: "Multi-Direct"}",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Sur le match: ${match.home_team} vs ${match.away_team}",
                    color = Color.Gray,
                    fontSize = 14.sp
                )
                
                Spacer(Modifier.height(20.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = onAccept,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("VOIR", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = { 
                            visible = false
                            onDismiss() 
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF222222)),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("IGNORER", color = Color.Gray, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
