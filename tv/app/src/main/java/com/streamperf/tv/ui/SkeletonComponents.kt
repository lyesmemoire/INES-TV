package com.streamperf.tv.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
internal fun shimmerBrush(): Brush {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1200f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1100, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmer_anim"
    )
    return Brush.linearGradient(
        colors = listOf(
            Color(0xFF27272A),
            Color(0xFF3F3F46),
            Color(0xFF27272A)
        ),
        start = Offset(0f, 0f),
        end = Offset(translateAnim, translateAnim)
    )
}

@Composable
fun SkeletonChannelCard() {
    val brush = shimmerBrush()
    Box(
        modifier = Modifier
            .width(300.dp)
            .height(170.dp)
            .background(brush, RoundedCornerShape(12.dp))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.65f)
                    .height(14.dp)
                    .background(Color(0xFF52525B), RoundedCornerShape(4.dp))
            )
            Spacer(modifier = Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.35f)
                    .height(10.dp)
                    .background(Color(0xFF3F3F46), RoundedCornerShape(4.dp))
            )
        }
    }
}

@Composable
fun SkeletonHeroSection() {
    val brush = shimmerBrush()
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 20.dp, bottom = 20.dp)
    ) {
        // Badge row
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.padding(bottom = 24.dp)
        ) {
            Box(modifier = Modifier.width(90.dp).height(28.dp).background(brush, RoundedCornerShape(8.dp)))
            Box(modifier = Modifier.width(80.dp).height(28.dp).background(brush, RoundedCornerShape(8.dp)))
        }

        // Teams + score row
        Row(
            horizontalArrangement = Arrangement.spacedBy(40.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Home team
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(modifier = Modifier.size(100.dp).background(brush, RoundedCornerShape(50.dp)))
                Spacer(modifier = Modifier.height(16.dp))
                Box(modifier = Modifier.width(80.dp).height(18.dp).background(brush, RoundedCornerShape(4.dp)))
            }
            // Score
            Box(modifier = Modifier.width(130.dp).height(64.dp).background(brush, RoundedCornerShape(8.dp)))
            // Away team
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(modifier = Modifier.size(100.dp).background(brush, RoundedCornerShape(50.dp)))
                Spacer(modifier = Modifier.height(16.dp))
                Box(modifier = Modifier.width(80.dp).height(18.dp).background(brush, RoundedCornerShape(4.dp)))
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        // Button skeleton
        Box(
            modifier = Modifier
                .width(200.dp)
                .height(48.dp)
                .background(brush, RoundedCornerShape(12.dp))
        )
    }
}

@Composable
fun SkeletonChannelRow() {
    Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
        repeat(4) { SkeletonChannelCard() }
    }
}
