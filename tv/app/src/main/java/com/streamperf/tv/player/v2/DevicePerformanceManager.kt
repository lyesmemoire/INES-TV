package com.streamperf.tv.player.v2

import android.app.ActivityManager
import android.content.Context

object DevicePerformanceManager {
    fun isWarmPoolAllowed(context: Context): Boolean {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)

        // Return true if system RAM is greater than or equal to 3GB
        // 3GB = 3221225472 bytes
        return memInfo.totalMem >= 3L * 1024 * 1024 * 1024
    }
}
