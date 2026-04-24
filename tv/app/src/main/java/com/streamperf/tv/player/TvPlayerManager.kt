package com.streamperf.tv.player

import android.content.Context
import androidx.media3.common.*
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.upstream.DefaultAllocator
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import com.streamperf.tv.player.qoe.QoEEngine
import com.streamperf.tv.ads.AdOrchestrator
import com.streamperf.tv.ads.AdAnalytics

class TvPlayerManager(private val context: Context) {

    private var activePlayer: ExoPlayer? = null
    private var standbyPlayer: ExoPlayer? = null
    private val switchLock = Mutex()

    private var currentSources: List<StreamSource> = emptyList()
    private var currentIndex = 0

    private val qoe = QoEEngine()
    private val adOrchestrator = AdOrchestrator(context)
    private val adAnalytics = AdAnalytics(context)
    
    // Lifecycle-bound scope for OTT reliability
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var watchdogJob: Job? = null

    private fun createPlayer(): ExoPlayer {
        val allocator = DefaultAllocator(true, 16 * 1024)
        val loadControl = DefaultLoadControl.Builder()
            .setAllocator(allocator)
            .setBufferDurationsMs(
                5_000,
                30_000, // Adaptive for TV networks
                1_500,
                3_000
            )
            .build()

        return ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build()
            .apply {
                setHandleAudioBecomingNoisy(true)
            }
    }

    fun play(sources: List<StreamSource>) {
        currentSources = sources.sortedByDescending { it.priority }
        currentIndex = 0

        qoe.onStart()
        
        val qoeScore = qoe.computeScore()
        
        // 🌐 Network Hardening: Ads on IO thread
        scope.launch(Dispatchers.IO) {
            try {
                val ad = withTimeoutOrNull(2000) {
                    adOrchestrator.requestAd(qoeScore.toFloat())
                }
                
                withContext(Dispatchers.Main) {
                    ad?.let { showAd(it) }
                    
                    if (activePlayer == null) activePlayer = createPlayer()
                    if (standbyPlayer == null) standbyPlayer = createPlayer()
                    
                    playCurrent()
                    preloadNext()
                    startWatchdog()
                }
            } catch (e: Exception) {
                // Fail silent -> continue playback
                withContext(Dispatchers.Main) {
                    playCurrent()
                }
            }
        }
    }

    private fun playCurrent() {
        val player = activePlayer ?: return
        val source = currentSources[currentIndex]
        val mediaItem = buildMediaItem(source)

        player.setMediaItem(mediaItem)
        player.prepare()
        player.playWhenReady = true

        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_READY) qoe.onFirstFrame()
                if (state == Player.STATE_BUFFERING) qoe.onBufferStart()
            }

            override fun onPlayerError(error: PlaybackException) {
                handleError()
            }
        })
    }

    private fun preloadNext() {
        if (currentIndex + 1 >= currentSources.size) return
        val standby = standbyPlayer ?: return

        val next = currentSources[currentIndex + 1]
        val mediaItem = buildMediaItem(next)

        standby.setMediaItem(mediaItem)
        standby.prepare()
    }

    /**
     * 🔴 RISQUE #1 FIX: Mutex Serialized Switch
     */
    fun seamlessSwitch() {
        scope.launch {
            switchLock.withLock {
                val old = activePlayer
                activePlayer = standbyPlayer
                
                // Activate standby
                activePlayer?.play()
                currentIndex++

                // Clean release of old player immediately
                old?.apply {
                    stop()
                    clearMediaItems()
                    release()
                }
                
                // Prepare new standby
                standbyPlayer = createPlayer()
                preloadNext()
            }
        }
    }

    private fun handleError() {
        if (currentIndex + 1 < currentSources.size) {
            seamlessSwitch()
        } else {
            restartPlayer()
        }
    }

    private fun restartPlayer() {
        releasePlayer()
        activePlayer = createPlayer()
        standbyPlayer = createPlayer()
        play(currentSources)
    }

    private fun buildMediaItem(source: StreamSource): MediaItem {
        return MediaItem.Builder()
            .setUri(source.url)
            .build()
    }

    /**
     * 🔴 RISQUE #2 FIX: Supervisor Watchdog
     */
    private fun startWatchdog() {
        watchdogJob?.cancel()

        watchdogJob = scope.launch(Dispatchers.IO) {
            while (isActive) {
                delay(10000)

                withContext(Dispatchers.Main) {
                    val player = activePlayer ?: return@withContext
                    val state = player.playbackState

                    if (state == Player.STATE_BUFFERING || state == Player.STATE_IDLE) {
                        handleError()
                    }

                    val qoeScore = qoe.computeScore()
                    if (qoeScore < 60) {
                        refreshTokenSilently(qoeScore)
                    }
                }
            }
        }
    }

    private suspend fun refreshTokenSilently(qoeScore: Int) {
        try {
            val simulatedNewUrl = currentSources[currentIndex].url + "&refreshed=true"
            val newSource = StreamSource(simulatedNewUrl, priority = 999)
            
            val mutableSources = currentSources.toMutableList()
            if (currentIndex + 1 < mutableSources.size) {
                mutableSources.add(currentIndex + 1, newSource)
            } else {
                mutableSources.add(newSource)
            }
            currentSources = mutableSources

            withContext(Dispatchers.Main) {
                preloadNext()
                seamlessSwitch()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * 🧹 CLEAN RELEASE (CRITICAL FIX)
     */
    fun releasePlayer() {
        watchdogJob?.cancel()
        
        activePlayer?.apply {
            stop()
            clearMediaItems()
            release()
        }
        activePlayer = null

        standbyPlayer?.apply {
            stop()
            clearMediaItems()
            release()
        }
        standbyPlayer = null
    }

    fun destroy() {
        scope.cancel()
        releasePlayer()
    }

    fun getPlayer(): ExoPlayer? = activePlayer

    private fun showAd(ad: com.streamperf.tv.ads.AdResponse) {
        // Run on IO thread
        scope.launch(Dispatchers.IO) {
            try {
                // simulate SDK ad load (without Thread.sleep on main)
                delay(250) 
                adOrchestrator.sendImpression(ad.impressionToken)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
