"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Hls from "hls.js"

interface HLSPlayerConfig {
  autoPlay?: boolean
  startAt?: number
}

export function useHLSPlayer(streamUrl: string, config: HLSPlayerConfig = {}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qualityLevels, setQualityLevels] = useState<{ id: number, height: number }[]>([])
  const [currentQuality, setCurrentQuality] = useState<number>(-1) // -1 is Auto
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const initPlayer = useCallback(() => {
    if (!videoRef.current || !streamUrl) return

    const video = videoRef.current

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      })

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setQualityLevels(data.levels.map((l, i) => ({ id: i, height: l.height })))
        if (config.autoPlay) {
          video.play().catch(e => console.warn("Autoplay blocked:", e))
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(hls.autoLevelEnabled ? -1 : data.level)
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error, trying to recover...")
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error, trying to recover...")
              hls.recoverMediaError()
              break
            default:
              console.error("Unrecoverable error:", data)
              setError("Unrecoverable error: " + data.details)
              hls.destroy()
              break
          }
        }
      })

      hlsRef.current = hls
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = streamUrl
      video.addEventListener("loadedmetadata", () => {
        if (config.autoPlay) video.play()
      })
    } else {
      setError("HLS is not supported in this browser.")
    }
  }, [streamUrl, config.autoPlay])

  useEffect(() => {
    initPlayer()
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [initPlayer])

  // Video element events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsBuffering(true)
    const onPlaying = () => setIsBuffering(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onVolumeChange = () => {
        setVolume(video.volume)
        setIsMuted(video.muted)
    }

    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("waiting", onWaiting)
    video.addEventListener("playing", onPlaying)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("durationchange", onDurationChange)
    video.addEventListener("volumechange", onVolumeChange)

    return () => {
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("waiting", onWaiting)
      video.removeEventListener("playing", onPlaying)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("durationchange", onDurationChange)
      video.removeEventListener("volumechange", onVolumeChange)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
    }
  }

  const setQuality = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId
      setCurrentQuality(levelId)
    }
  }

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const changeVolume = (val: number) => {
    if (videoRef.current) {
      videoRef.current.volume = val
      setVolume(val)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  return {
    videoRef,
    isPlaying,
    isBuffering,
    error,
    qualityLevels,
    currentQuality,
    duration,
    currentTime,
    volume,
    isMuted,
    togglePlay,
    setQuality,
    seek,
    changeVolume,
    toggleMute
  }
}
