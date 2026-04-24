package com.streamperf.tv.player

data class StreamSource(
    val url: String,
    val type: String = "hls",
    val priority: Int = 0,
    val label: String? = null,
    val cdn: String? = null,
    val drmLicenseUrl: String? = null
)
