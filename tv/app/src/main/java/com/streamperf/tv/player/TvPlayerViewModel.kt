package com.streamperf.tv.player

import androidx.lifecycle.ViewModel

/**
 * 🧠 TV PLAYER VIEWMODEL (V3)
 * Orchestrates advanced playback logic including preloading and seamless switching.
 */
class TvPlayerViewModel : ViewModel() {

    private var manager: TvPlayerManager? = null

    fun attach(manager: TvPlayerManager) {
        this.manager = manager
    }

    fun play(channelId: String, sources: List<StreamSource>) {
        manager?.play(channelId, sources)
    }

    fun preloadBestSource() {
        manager?.preloadBestSource()
    }

    fun switch() {
        manager?.switchToNext()
    }

    override fun onCleared() {
        super.onCleared()
        manager?.release()
    }
}
