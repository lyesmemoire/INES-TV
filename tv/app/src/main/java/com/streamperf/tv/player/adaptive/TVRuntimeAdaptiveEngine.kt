package com.streamperf.tv.player.adaptive

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import androidx.media3.exoplayer.SeekParameters

data class DeviceProfile(
    val ramGb: Int,
    val isLowEnd: Boolean,
    val isTvBox: Boolean,
    val manufacturer: String,
    val model: String,
    val sdk: Int
)

sealed class PerformanceProfile {
    object Ultra : PerformanceProfile()
    object Balanced : PerformanceProfile()
    object Safe : PerformanceProfile()
}

class DeviceDetector(private val context: Context) {
    fun detect(): DeviceProfile {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)

        val ramGb = (memInfo.totalMem / (1024 * 1024 * 1024)).toInt()
        val isLowEnd = ramGb <= 2
        val isTvBox = context.packageManager.hasSystemFeature("android.software.leanback")

        return DeviceProfile(
            ramGb = ramGb,
            isLowEnd = isLowEnd,
            isTvBox = isTvBox,
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL,
            sdk = Build.VERSION.SDK_INT
        )
    }
}

class ProfileMapper {
    fun map(device: DeviceProfile): PerformanceProfile {
        return when {
            device.ramGb >= 4 -> PerformanceProfile.Ultra
            device.ramGb >= 3 -> PerformanceProfile.Balanced
            else -> PerformanceProfile.Safe
        }
    }
}

class TVRuntimeAdaptiveEngine(context: Context) {
    private val device = DeviceDetector(context).detect()
    val profile = ProfileMapper().map(device)

    fun getBufferSizeMs(): Pair<Int, Int> {
        return when (profile) {
            is PerformanceProfile.Ultra -> Pair(5_000, 15_000)
            is PerformanceProfile.Balanced -> Pair(3_000, 10_000)
            is PerformanceProfile.Safe -> Pair(1_500, 5_000)
        }
    }

    fun getWarmPoolEnabled(): Boolean {
        return profile != PerformanceProfile.Safe
    }

    fun getSeekParameters(): SeekParameters {
        return SeekParameters.CLOSEST_SYNC
    }

    fun getMaxPreloadStreams(): Int {
        return when (profile) {
            is PerformanceProfile.Ultra -> 3
            is PerformanceProfile.Balanced -> 2
            is PerformanceProfile.Safe -> 0
        }
    }
}
