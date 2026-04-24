package com.streamperf.tv.ui.search

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Card
import androidx.tv.material3.CardDefaults
import androidx.tv.material3.ExperimentalTvMaterial3Api

val keyboardLayout = listOf(
    listOf("A","B","C","D","E","F"),
    listOf("G","H","I","J","K","L"),
    listOf("M","N","O","P","Q","R"),
    listOf("S","T","U","V","W","X"),
    listOf("Y","Z","0","1","2","3"),
    listOf("4","5","6","7","8","9"),
    listOf("⌫","ESPACE","OK")
)

@Composable
fun TvSearchKeyboard(
    onKeyPress: (String) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        keyboardLayout.forEach { row ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.padding(vertical = 5.dp)
            ) {
                row.forEach { key ->
                    KeyItem(key = key, onClick = onKeyPress)
                }
            }
        }
    }
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun KeyItem(
    key: String,
    onClick: (String) -> Unit
) {
    var isFocused by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }
    val isAction = key.length > 1 || key == "⌫"
    val scale by animateFloatAsState(if (isFocused) 1.15f else 1.0f)

    Card(
        onClick = { onClick(key) },
        modifier = Modifier
            .width(if (isAction) 80.dp else 45.dp)
            .height(45.dp)
            .scale(scale)
            .focusRequester(focusRequester)
            .onFocusChanged { isFocused = it.isFocused },
        shape = CardDefaults.shape(RoundedCornerShape(8.dp)),
        colors = CardDefaults.colors(
            containerColor = Color(0xFF161B2A),
            focusedContainerColor = Color(0xFF6366F1)
        )
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
            Text(
                text = key,
                color = Color.White,
                fontSize = if (isAction) 11.sp else 16.sp,
                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
            )
        }
    }

    LaunchedEffect(Unit) {
        if (key == "A") focusRequester.requestFocus()
    }
}
