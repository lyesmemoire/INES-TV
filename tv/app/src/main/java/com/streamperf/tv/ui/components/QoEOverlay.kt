package com.streamperf.tv.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Text
import com.streamperf.tv.player.qoe.QoEMetrics

/**
 * 📊 QoE OVERLAY
 * Debug/Monitoring overlay to visualize stream health on TV.
 */
@Composable
fun QoEOverlay(
    score: Double,
    metrics: QoEMetrics
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        contentAlignment = Alignment.TopEnd
    ) {
        Column(
            modifier = Modifier
                .background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(8.dp))
                .padding(16.dp)
        ) {
            Text(
                text = "QoE MONITOR",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                val scoreColor = when {
                    score >= 90 -> Color(0xFF22C55E) // Green
                    score >= 60 -> Color(0xFFEAB308) // Yellow
                    else -> Color(0xFFEF4444) // Red
                }
                Text(
                    text = "${score.toInt()}",
                    color = scoreColor,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = " / 100",
                    color = Color.Gray,
                    fontSize = 16.sp
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = "Startup: ${metrics.startupTime}ms", color = Color.LightGray, fontSize = 12.sp)
            Text(text = "Rebuffers: ${metrics.rebufferCount}", color = Color.LightGray, fontSize = 12.sp)
            Text(text = "Errors: ${metrics.errorCount}", color = Color.LightGray, fontSize = 12.sp)
        }
    }
}
