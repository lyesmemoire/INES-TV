package com.streamperf.tv.os

import android.content.Context
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.FileNotFoundException

class GraphPersistence(private val context: Context) {
    private val fileName = "behavior_graph.json"
    private val jsonConfig = Json { ignoreUnknownKeys = true }

    fun save(graph: BehaviorGraph) {
        try {
            val jsonString = jsonConfig.encodeToString(graph)
            context.openFileOutput(fileName, Context.MODE_PRIVATE).use {
                it.write(jsonString.toByteArray())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun load(): BehaviorGraph? {
        return try {
            val fileContent = context.openFileInput(fileName).bufferedReader().use { it.readText() }
            jsonConfig.decodeFromString<BehaviorGraph>(fileContent)
        } catch (e: FileNotFoundException) {
            null // Initial creation
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
