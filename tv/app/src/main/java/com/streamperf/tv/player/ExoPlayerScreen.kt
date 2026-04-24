package com.streamperf.tv.player

import androidx.activity.compose.BackHandler
import androidx.annotation.OptIn
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import androidx.tv.material3.*
import androidx.compose.material3.CircularProgressIndicator
import coil.compose.AsyncImage
import com.streamperf.tv.TvRepository
import com.streamperf.tv.models.Channel
import com.streamperf.tv.os.AITVOSOrchestrator
import com.streamperf.tv.player.adaptive.TVRuntimeAdaptiveEngine
import com.streamperf.tv.player.v2.RuntimeOrchestrator
import com.streamperf.tv.os.TVRemoteCommandManager
import com.streamperf.tv.os.TVIntelligenceManager
import com.streamperf.tv.models.IntelligenceEvent
import com.streamperf.tv.models.PredictiveEvent
import com.streamperf.tv.models.SportsEvent
import com.streamperf.tv.ui.components.RemoteCommandOverlay
import com.streamperf.tv.ui.components.GoalOverlay
import com.streamperf.tv.ui.components.PredictiveOverlay
import com.streamperf.tv.ui.components.SmartZapPrompt
import com.streamperf.tv.ui.components.QoEOverlay
import com.streamperf.tv.player.qoe.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import com.streamperf.tv.AuthManager

/**
 * 🎬 EXO PLAYER SCREEN (TV)
 * High-performance player with AI overlays, Predictive SmartZap, and Adaptive Buffer.
 */
@OptIn(UnstableApi::class, ExperimentalTvMaterial3Api::class)
@Composable
fun ExoPlayerScreen(
    channels: List<Channel>,
    startIndex: Int,
    onBack: () -> Unit,
    repository: TvRepository,
    aiOS: AITVOSOrchestrator? = null
) {
    val context = LocalContext.current
    
    var currentIndex by remember { mutableStateOf(startIndex) }
    var isBuffering by remember { mutableStateOf(true) }
    var showControls by remember { mutableStateOf(true) }
    
    val adaptiveEngine = remember { TVRuntimeAdaptiveEngine(context) }
    val engine = remember { TvPlayerEngine.init(context, adaptiveEngine) }
    val orchestrator = remember { RuntimeOrchestrator(context, engine, adaptiveEngine) }

    val remoteManager = remember { TVRemoteCommandManager(context) }
    val intelligenceManager = remember { TVIntelligenceManager(context) }
    
    var lastRemoteCommand by remember { mutableStateOf<String?>(null) }
    var activeGoalEvent by remember { mutableStateOf<IntelligenceEvent?>(null) }
    var activePredictiveEvent by remember { mutableStateOf<PredictiveEvent?>(null) }
    var activeZapEvent by remember { mutableStateOf<Pair<IntelligenceEvent, SportsEvent>?>(null) }
    var activePredictiveZapEvent by remember { mutableStateOf<Pair<PredictiveEvent, SportsEvent>?>(null) }

    // 1. Core Lifecycle
    LaunchedEffect(Unit) {
        orchestrator.start(channels, startIndex)
        aiOS?.resetSession()
        
        AuthManager().getUserId()?.let { uid ->
            remoteManager.startListening(uid)
            intelligenceManager.start(uid)
        }
    }

    // 2. Intelligence Event Consumer
    LaunchedEffect(Unit) {
        intelligenceManager.events.collectLatest { event ->
            val currentCh = channels.getOrNull(currentIndex) ?: return@collectLatest
            
            // Map GOAL on CURRENT match
            if (event.type == "GOAL" && event.channelId == currentCh.id) {
                activeGoalEvent = event
            } 
            // Map GOAL on OTHER match for SmartZap
            else if (event.type == "GOAL" && event.channelId != currentCh.id) {
                val otherMatch = SportsEvent(
                    id = event.channelId, 
                    home_team = event.data["team"] ?: "Unknown", 
                    away_team = "Opponent", 
                    competition = "Live Match", 
                    status = "live", 
                    start_time = ""
                )
                activeZapEvent = event to otherMatch
            }
        }
    }

    // 3. Predictive Event Consumer
    LaunchedEffect(Unit) {
        intelligenceManager.predictiveEvents.collectLatest { event ->
            val currentCh = channels.getOrNull(currentIndex) ?: return@collectLatest
            
            if (event.match_id == currentCh.id) {
                activePredictiveEvent = event
            } else if (event.event_type == "HIGH_PRESSURE") {
                val otherMatch = SportsEvent(
                    id = event.match_id ?: "", 
                    home_team = event.sports_events?.home_team ?: "Match en cours", 
                    away_team = event.sports_events?.away_team ?: "🔥 Tension", 
                    competition = "Anticipation AI", 
                    status = "live", 
                    start_time = ""
                )
                activePredictiveZapEvent = event to otherMatch
            }
        }
    }

    // 4. Remote Command Consumer
    LaunchedEffect(Unit) {
        remoteManager.commands.collectLatest { cmd ->
            when (cmd.type) {
                "zap" -> {
                    cmd.channelId?.let { targetId ->
                        val targetIndex = channels.indexOfFirst { it.id == targetId }
                        if (targetIndex != -1) {
                            orchestrator.start(channels, targetIndex)
                            lastRemoteCommand = "zap"
                        }
                    }
                }
                "volume_up", "volume_down" -> {
                    lastRemoteCommand = cmd.type
                }
            }
        }
    }

    // 5. Player Events
    val qoe = remember { QoEEngine() }
    var qoeScore by remember { mutableDoubleStateOf(100.0) }
    var qoeMetrics by remember { mutableStateOf(QoEMetrics()) }
    var showQoE by remember { mutableStateOf(false) }

    DisposableEffect(engine) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                isBuffering = state == Player.STATE_BUFFERING
                when (state) {
                    Player.STATE_READY -> { 
                        qoe.onReady()
                        qoe.onBufferEnd()
                        qoeScore = qoe.computeScore()
                        qoeMetrics = qoe.snapshot() 
                    }
                    Player.STATE_BUFFERING -> { 
                        qoe.onBufferStart()
                        qoeScore = qoe.computeScore()
                        qoeMetrics = qoe.snapshot()
                    }
                }
            }
            
            override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                qoe.onError()
                qoeScore = qoe.computeScore()
                qoeMetrics = qoe.snapshot()
            }

            override fun onMediaItemTransition(mediaItem: androidx.media3.common.MediaItem?, reason: Int) {
                val newIndex = engine.currentMediaItemIndex
                if (newIndex != androidx.media3.common.C.INDEX_UNSET) {
                    currentIndex = newIndex
                    qoe.onStart()
                }
            }
        }
        engine.addListener(listener)
        onDispose {
            engine.removeListener(listener)
            orchestrator.release()
            remoteManager.stop()
        }
    }

    val currentChannel = channels.getOrNull(currentIndex) ?: return
    var sessionStartTime by remember { mutableStateOf(System.currentTimeMillis()) }

    // 6. Analytics & History Hook
    LaunchedEffect(currentIndex) {
        val now = System.currentTimeMillis()
        val durationMs = now - sessionStartTime
        if (durationMs > 2000) {
            channels.getOrNull(currentIndex)?.let { aiOS?.onWatch(it, durationMs) }
        }
        sessionStartTime = now
        channels.getOrNull(currentIndex)?.let { 
            repository.recordHistory(it.id, it.category) 
        }
    }

    // 7. Auto-hide controls
    LaunchedEffect(showControls, currentIndex) {
        if (showControls) {
            delay(5000)
            showControls = false
        }
    }

    BackHandler { onBack() }

    val focusRequester = remember { FocusRequester() }
    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .focusRequester(focusRequester)
            .onPreviewKeyEvent { event ->
                if (event.type == KeyEventType.KeyDown) {
                    when (event.nativeKeyEvent.keyCode) {
                        android.view.KeyEvent.KEYCODE_DPAD_LEFT -> { orchestrator.onZapPrev(); showControls = true; true }
                        android.view.KeyEvent.KEYCODE_DPAD_RIGHT -> { orchestrator.onZapNext(); showControls = true; true }
                        android.view.KeyEvent.KEYCODE_DPAD_UP,
                        android.view.KeyEvent.KEYCODE_DPAD_DOWN -> { showControls = true; true }
                        android.view.KeyEvent.KEYCODE_DPAD_CENTER,
                        android.view.KeyEvent.KEYCODE_ENTER -> { showControls = !showControls; true }
                        android.view.KeyEvent.KEYCODE_MENU,
                        android.view.KeyEvent.KEYCODE_I -> { showQoE = !showQoE; true }
                        android.view.KeyEvent.KEYCODE_BACK -> {
                            if (showControls || showQoE) { 
                                showControls = false
                                showQoE = false
                                true 
                            } else false
                        }
                        else -> false
                    }
                } else false
            }
            .focusable()
    ) {
        // PLAYER VIEW
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = engine
                    useController = false
                    resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // INDICATOR
        if (isBuffering) CircularProgressIndicator(Modifier.align(Alignment.Center), color = Color(0xFF6366F1), strokeWidth = 4.dp)

        AnimatedVisibility(
            visible = showControls,
            enter = slideInVertically { -it } + fadeIn(),
            exit = slideOutVertically { -it } + fadeOut(),
            modifier = Modifier.align(Alignment.TopCenter).padding(32.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().background(Color.Black.copy(alpha = 0.85f), RoundedCornerShape(16.dp)).padding(24.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(model = currentChannel.thumbnail, contentDescription = null, modifier = Modifier.size(64.dp).background(Color(0xFF222222), RoundedCornerShape(8.dp)))
                Spacer(modifier = Modifier.width(20.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = currentChannel.name, color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = currentChannel.category.uppercase(), color = Color(0xFF6366F1), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        if (currentChannel.status == "LIVE") {
                            Spacer(Modifier.width(12.dp))
                            Box(modifier = Modifier.background(Color(0xFFEF4444), RoundedCornerShape(4.dp)).padding(horizontal = 6.dp, vertical = 2.dp)) {
                                Text("EN DIRECT", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("${currentIndex + 1} / ${channels.size}", color = Color.Gray, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("ZAPPING", color = Color.White.copy(alpha = 0.5f), fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Appuyez sur (I) pour QoE", color = Color.Gray, fontSize = 10.sp)
                }
            }
        }

        // QOE OVERLAY
        AnimatedVisibility(
            visible = showQoE,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            QoEOverlay(score = qoeScore, metrics = qoeMetrics)
        }

        // OVERLAYS
        RemoteCommandOverlay(
            commandType = lastRemoteCommand,
            onFinished = { lastRemoteCommand = null }
        )

        activeGoalEvent?.let { event ->
            GoalOverlay(
                event = event,
                isFavorite = intelligenceManager.isFavorite(event.data["team"]),
                onFinished = { activeGoalEvent = null }
            )
        }

        activeZapEvent?.let { (event, match) ->
            SmartZapPrompt(
                event = event,
                match = match,
                onAccept = {
                    val targetIndex = channels.indexOfFirst { it.id == match.id }
                    if (targetIndex != -1) {
                         orchestrator.start(channels, targetIndex)
                    }
                    activeZapEvent = null
                },
                onDismiss = { activeZapEvent = null }
            )
        }

        activePredictiveEvent?.let { event ->
            PredictiveOverlay(
                event = event,
                onFinished = { activePredictiveEvent = null }
            )
        }

        activePredictiveZapEvent?.let { (event, match) ->
            SmartZapPrompt(
                event = IntelligenceEvent(id=event.id, type = "PRÉDICTION", data = mapOf("team" to "Tension Max")),
                match = match,
                onAccept = {
                    val targetIndex = channels.indexOfFirst { it.id == match.id }
                    if (targetIndex != -1) {
                        orchestrator.start(channels, targetIndex)
                    }
                    activePredictiveZapEvent = null
                },
                onDismiss = { activePredictiveZapEvent = null }
            )
        }
    }
}
