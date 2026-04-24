package com.streamperf.tv.utils

import android.util.Log

object TVCrashLogger {

    private const val GLOBAL_TAG = "StreamPerfOS"

    fun log(tag: String, error: Throwable) {
        // Output in Logcat normally
        Log.e("$GLOBAL_TAG: $tag", error.message ?: "Unknown Error", error)
        
        // Output standard console (e.g., if debugging via pure raw console)
        println("TV-CRASH [$tag]: ${error.message}")
        error.printStackTrace()
    }

    fun logEvent(event: String) {
        Log.d("$GLOBAL_TAG: EVENT", event)
        println("TV-EVENT: $event")
    }
}
