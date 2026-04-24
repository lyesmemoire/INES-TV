package com.streamperf.tv.os

import android.content.Context
import android.provider.Settings
import com.streamperf.tv.SupabaseManager
import com.streamperf.tv.utils.TVCrashLogger
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.realtime.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.serialization.json.*

/**
 * 📱 TV REMOTE COMMAND MANAGER
 * Listens for remote commands (zapping, volume, power) coming from the mobile companion app.
 */
class TVRemoteCommandManager(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val _commands = MutableSharedFlow<RemoteCommand>()
    val commands = _commands.asSharedFlow()

    private val deviceId: String by lazy {
        Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
    }

    fun startListening(userId: String) {
        scope.launch {
            try {
                // 1. Initial Registration/Update
                SupabaseManager.client.postgrest["devices"].upsert(
                    buildJsonObject {
                        put("id", deviceId)
                        put("user_id", userId)
                        put("model", android.os.Build.MODEL)
                        put("status", "ONLINE")
                        put("last_seen", System.currentTimeMillis())
                    }
                )

                // 2. Realtime Command Channel (v2.x standard)
                val channel = SupabaseManager.client.realtime.channel("device-commands")
                val changeFlow = channel.postgresChangeFlow<PostgresAction.Update>(schema = "public") {
                    table = "devices"
                    filter = "id=eq.$deviceId"
                }

                scope.launch {
                    changeFlow.collect { action ->
                        val data = action.record
                        val cmd = data["last_command"]?.jsonPrimitive?.contentOrNull
                        if (cmd != null) {
                            val payload = data["command_payload"]?.jsonObject
                            val channelId = data["last_channel"]?.jsonPrimitive?.contentOrNull
                            
                            _commands.emit(RemoteCommand(
                                type = cmd,
                                channelId = channelId,
                                payload = payload
                            ))
                            
                            TVCrashLogger.logEvent("Remote Command Received: $cmd")
                        }
                    }
                }
                
                channel.subscribe()
                
            } catch (e: Exception) {
                TVCrashLogger.log("RemoteCommandManager", e)
            }
        }
    }

    fun stop() {
        scope.cancel()
    }
}

data class RemoteCommand(
    val type: String,
    val channelId: String? = null,
    val payload: JsonObject? = null
)
