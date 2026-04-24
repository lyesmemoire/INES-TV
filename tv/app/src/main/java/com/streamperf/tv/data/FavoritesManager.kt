package com.streamperf.tv.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore("favorites")

class FavoritesManager(private val context: Context) {

    private val FAVORITES_KEY = stringSetPreferencesKey("favorites_ids")

    val favoritesFlow: Flow<Set<String>> = context.dataStore.data
        .map { prefs -> prefs[FAVORITES_KEY] ?: emptySet() }

    suspend fun toggleFavorite(channelId: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[FAVORITES_KEY]?.toMutableSet() ?: mutableSetOf()

            if (current.contains(channelId)) {
                current.remove(channelId)
            } else {
                current.add(channelId)
            }

            prefs[FAVORITES_KEY] = current
        }
    }
}
