package com.streamperf.tv.utils

import android.content.Context
import android.provider.Settings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import io.github.jan.supabase.postgrest.postgrest
import com.streamperf.tv.SupabaseManager

object DeviceLock {

    fun getDeviceId(context: Context): String {
        return Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ANDROID_ID
        )
    }

    suspend fun registerDeviceToSupabase(context: Context, userId: String) {
        val deviceId = getDeviceId(context)
        withContext(Dispatchers.IO) {
            try {
                // Example request assuming a table `user_devices` exists
                // SupabaseManager.client.postgrest["user_devices"].insert(DeviceRecord(userId, deviceId))
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
