import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode2, Smartphone } from 'lucide-react';

const KOTLIN_FILES = [
  {
    name: 'build.gradle.kts',
    code: `dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")

    // RecyclerView
    implementation("androidx.recyclerview:recyclerview:1.3.2")

    // ExoPlayer (v2)
    implementation("com.google.android.exoplayer:exoplayer:2.19.1")

    // Network
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Lifecycle (MVVM)
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")

    // (Option TV)
    implementation("androidx.leanback:leanback:1.0.0")
}`
  },
  {
    name: 'DeviceProfiler.kt',
    code: `package com.tonapp.streaming.core.device

import android.app.ActivityManager
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities

enum class DeviceTier { LOW, MID, HIGH }
enum class NetworkQuality { POOR, MODERATE, EXCELLENT }
enum class NetworkType { WIFI, CELLULAR, UNKNOWN }

data class DeviceProfile(
    val tier: DeviceTier, 
    val isLowRam: Boolean, 
    val networkQuality: NetworkQuality,
    val networkType: NetworkType,
    val recommendedImageCacheSizeMb: Int
)

object DeviceProfiler {
    fun profileDevice(context: Context): DeviceProfile {
        // 1. Profile Device Hardware
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)
        
        val totalRamGb = memoryInfo.totalMem / (1024 * 1024 * 1024.0)
        val isLowRam = activityManager.isLowRamDevice

        val tier = when {
            isLowRam || totalRamGb <= 2.0 -> DeviceTier.LOW
            totalRamGb <= 4.0 -> DeviceTier.MID
            else -> DeviceTier.HIGH
        }

        // Calculate safe cache size to prevent OOM
        // Standard practice: Use a fraction of available memory, but cap strictly for low RAM
        val memoryClassMb = activityManager.memoryClass
        val recommendedImageCacheSizeMb = if (isLowRam || tier == DeviceTier.LOW) {
            // Cap at 10MB or 1/10th of memory class for low-end devices to prevent OOM
            minOf(10, memoryClassMb / 10)
        } else if (tier == DeviceTier.MID) {
            minOf(30, memoryClassMb / 8)
        } else {
            minOf(60, memoryClassMb / 6)
        }

        // 2. Profile Network Quality & Type
        val networkQuality = getNetworkQuality(context)
        val networkType = getNetworkType(context)

        return DeviceProfile(tier, isLowRam, networkQuality, networkType, recommendedImageCacheSizeMb)
    }

    private fun getNetworkType(context: Context): NetworkType {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return NetworkType.UNKNOWN
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return NetworkType.UNKNOWN

        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> NetworkType.WIFI
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> NetworkType.CELLULAR
            else -> NetworkType.UNKNOWN
        }
    }

    private fun getNetworkQuality(context: Context): NetworkQuality {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return NetworkQuality.POOR
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return NetworkQuality.POOR

        val downSpeedKbps = capabilities.linkDownstreamBandwidthKbps
        return when {
            downSpeedKbps < 2000 -> NetworkQuality.POOR // < 2 Mbps
            downSpeedKbps < 10000 -> NetworkQuality.MODERATE // 2 - 10 Mbps
            else -> NetworkQuality.EXCELLENT // > 10 Mbps
        }
    }
}`
  },
  {
    name: 'AdaptivePlayerFactory.kt',
    code: `package com.tonapp.streaming.core.player

import android.content.Context
import com.google.android.exoplayer2.DefaultLoadControl
import com.google.android.exoplayer2.DefaultRenderersFactory
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector
import com.tonapp.streaming.core.device.DeviceProfile
import com.tonapp.streaming.core.device.DeviceTier
import com.tonapp.streaming.core.device.NetworkQuality

object AdaptivePlayerFactory {
    fun create(context: Context, profile: DeviceProfile): ExoPlayer {
        val loadControlBuilder = DefaultLoadControl.Builder()
        
        // --- DYNAMIC BUFFER LOGIC ---
        // Prioritize stability on LOW tier or POOR network.
        // Prioritize low latency on HIGH tier with EXCELLENT network.
        val minBufferMs: Int
        val maxBufferMs: Int
        val bufferForPlaybackMs: Int
        val bufferForPlaybackAfterRebufferMs: Int

        if (profile.tier == DeviceTier.LOW || profile.networkQuality == NetworkQuality.POOR) {
            // STABILITY FIRST: Large buffers, wait longer before playing to prevent stuttering
            minBufferMs = 30_000
            maxBufferMs = 60_000
            bufferForPlaybackMs = 2_500
            bufferForPlaybackAfterRebufferMs = 5_000
        } else if (profile.tier == DeviceTier.HIGH && profile.networkQuality == NetworkQuality.EXCELLENT) {
            // LOW LATENCY: Small buffers, start playing almost immediately
            minBufferMs = 10_000
            maxBufferMs = 25_000
            bufferForPlaybackMs = 500
            bufferForPlaybackAfterRebufferMs = 1_500
        } else {
            // BALANCED: Standard configuration
            minBufferMs = 20_000
            maxBufferMs = 40_000
            bufferForPlaybackMs = 1_500
            bufferForPlaybackAfterRebufferMs = 3_000
        }

        loadControlBuilder.setBufferDurationsMs(
            minBufferMs,
            maxBufferMs,
            bufferForPlaybackMs,
            bufferForPlaybackAfterRebufferMs
        )

        val trackSelector = DefaultTrackSelector(context)
        val parametersBuilder = trackSelector.buildUponParameters()

        // --- DYNAMIC QUALITY SELECTION ---
        if (profile.tier == DeviceTier.LOW || profile.networkQuality == NetworkQuality.POOR) {
            // POOR/LOW: Cap at 480p, 1.5 Mbps to prevent buffering and decoding lag
            parametersBuilder
                .setMaxVideoSize(854, 480)
                .setMaxVideoBitrate(1_500_000)
                .setExceedVideoConstraintsIfNecessary(false)
        } else if (profile.tier == DeviceTier.MID || profile.networkQuality == NetworkQuality.MODERATE || profile.networkType == NetworkType.CELLULAR) {
            // MODERATE/MID/CELLULAR: Cap at 1080p, 5 Mbps to save data plan and ensure stability
            parametersBuilder
                .setMaxVideoSize(1920, 1080)
                .setMaxVideoBitrate(5_000_000)
                .setExceedVideoConstraintsIfNecessary(true)
        } else {
            // EXCELLENT/HIGH/WIFI: Unrestricted (4K allowed)
            parametersBuilder
                .clearVideoSizeConstraints()
                .setMaxVideoBitrate(Int.MAX_VALUE)
        }
        
        trackSelector.parameters = parametersBuilder.build()

        val renderersFactory = DefaultRenderersFactory(context)
            .setEnableDecoderFallback(true)

        return ExoPlayer.Builder(context)
            .setLoadControl(loadControlBuilder.build())
            .setTrackSelector(trackSelector)
            .setRenderersFactory(renderersFactory)
            .build()
    }
}`
  },
  {
    name: 'LiveChannelsViewModel.kt',
    code: `package com.tonapp.streaming.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

data class Channel(val id: String, val name: String, val streamUrl: String, val thumbnail: String)

class LiveChannelsViewModel : ViewModel() {
    private val client = OkHttpClient()
    
    private val _channels = MutableLiveData<List<Channel>>()
    val channels: LiveData<List<Channel>> = _channels

    fun startFetching(isLowDevice: Boolean, backendUrl: String) {
        viewModelScope.launch(Dispatchers.IO) {
            val delayMs = if (isLowDevice) 30_000L else 15_000L

            while (isActive) {
                try {
                    val request = Request.Builder().url(backendUrl).build()
                    client.newCall(request).execute().use { response ->
                        if (response.isSuccessful) {
                            val json = response.body?.string()
                            val parsedChannels = parseChannels(json)
                            _channels.postValue(parsedChannels)
                        }
                    }
                } catch (e: Exception) {
                    // Ignore network errors, retry on next loop
                }
                delay(delayMs)
            }
        }
    }

    private fun parseChannels(json: String?): List<Channel> {
        if (json == null) return emptyList()
        val list = mutableListOf<Channel>()
        try {
            val root = JSONObject(json)
            val channelsArray = root.getJSONArray("channels")
            for (i in 0 until channelsArray.length()) {
                val obj = channelsArray.getJSONObject(i)
                list.add(Channel(
                    id = obj.optString("id"),
                    name = obj.optString("name"),
                    streamUrl = obj.optString("streamUrl"),
                    thumbnail = obj.optString("thumbnail")
                ))
            }
        } catch (e: Exception) { e.printStackTrace() }
        return list
    }
}`
  },
  {
    name: 'ReconnectingPlayerListener.kt',
    code: `package com.tonapp.streaming.core.player

import android.util.Log
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.PlaybackException
import com.google.android.exoplayer2.Player
import kotlinx.coroutines.*

/**
 * Reconnection logic for ExoPlayer with exponential backoff.
 * Automatically attempts to reconnect after a short delay on fatal network errors.
 */
class ReconnectingPlayerListener(
    private val player: ExoPlayer,
    private val coroutineScope: CoroutineScope
) : Player.Listener {

    private var reconnectCount = 0
    private var reconnectJob: Job? = null
    private val MAX_RETRIES = 5

    override fun onPlayerError(error: PlaybackException) {
        Log.e("VideoPlayer", "Fatal error encountered: \${error.message}")
        
        // Check if it's a network error
        if (error.errorCode == PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_FAILED ||
            error.errorCode == PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_TIMEOUT ||
            error.errorCode == PlaybackException.ERROR_CODE_IO_BAD_HTTP_STATUS) {
            
            if (reconnectCount >= MAX_RETRIES) {
                Log.e("VideoPlayer", "Stream permanently unavailable after \$MAX_RETRIES attempts. Giving up.")
                // Notify UI about permanent failure here (e.g., via LiveData/Flow)
                return
            }

            reconnectCount++
            // Exponential backoff: 2s, 4s, 8s, max 15s
            val delayMs = Math.min(1000L * (1 shl reconnectCount), 15000L)
            
            Log.w("VideoPlayer", "Network error. Attempting to reconnect (Attempt \$reconnectCount/\$MAX_RETRIES) in \${delayMs / 1000}s...")
            
            reconnectJob?.cancel()
            reconnectJob = coroutineScope.launch(Dispatchers.Main) {
                delay(delayMs)
                Log.d("VideoPlayer", "Executing reconnection...")
                player.prepare()
                player.play()
            }
        }
    }

    override fun onPlaybackStateChanged(playbackState: Int) {
        if (playbackState == Player.STATE_READY && reconnectCount > 0) {
            Log.i("VideoPlayer", "Reconnected successfully after \$reconnectCount attempt(s)!")
            reconnectCount = 0
        }
    }
}`
  },
  {
    name: 'VideoPlayerActivity.kt',
    code: `package com.tonapp.streaming.ui

import android.app.PictureInPictureParams
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Rational
import androidx.appcompat.app.AppCompatActivity
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.ui.PlayerView
import com.tonapp.streaming.R

/**
 * Activity demonstrating Picture-in-Picture (PiP) mode for Android 8.0+
 */
class VideoPlayerActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private lateinit var playerView: PlayerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_video_player)
        playerView = findViewById(R.id.player_view)
        
        // Initialize player...
    }

    // Triggered when the user presses the Home button or switches apps
    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        enterPipMode()
    }

    private fun enterPipMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Set the aspect ratio for the PiP window (usually 16:9 for video)
            val aspectRatio = Rational(16, 9)
            val params = PictureInPictureParams.Builder()
                .setAspectRatio(aspectRatio)
                .build()
            
            enterPictureInPictureMode(params)
        }
    }

    // Handle UI changes when entering or exiting PiP mode
    override fun onPictureInPictureModeChanged(
        isInPictureInPictureMode: Boolean,
        newConfig: Configuration
    ) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
        if (isInPictureInPictureMode) {
            // Hide player controls and other UI elements
            playerView.useController = false
            supportActionBar?.hide()
        } else {
            // Restore player controls and UI
            playerView.useController = true
            supportActionBar?.show()
        }
    }
}`
  }
];

export default function AndroidCodeViewer({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(KOTLIN_FILES[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Android Studio Export</h2>
              <p className="text-xs text-zinc-400">Architecture Staff Engineer (Kotlin + ExoPlayer v2)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-zinc-950 border-r border-zinc-800 overflow-y-auto">
            <div className="p-3">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">Fichiers Kotlin</div>
              {KOTLIN_FILES.map((file, index) => (
                <button
                  key={file.name}
                  onClick={() => setActiveTab(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                    activeTab === index 
                      ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <FileCode2 className="w-4 h-4" />
                  {file.name}
                </button>
              ))}
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e] relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-sm transition-colors border border-zinc-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-sm font-mono text-zinc-300">
                <code>{KOTLIN_FILES[activeTab].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
