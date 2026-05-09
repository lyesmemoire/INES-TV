"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Hls from "hls.js"

// Some builds of hls.js export the class as .default
const HLS = (Hls as any).default || Hls

interface HLSPlayerConfig {
  autoPlay?: boolean
  startAt?: number
}

export type HLSPlayerState = ReturnType<typeof useHLSPlayer>

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const isLive = duration === Infinity || duration === 0

  const initPlayer = useCallback(() => {
    if (!videoRef.current || !streamUrl) {
      console.warn("HLS Player: Missing video element or stream URL", { streamUrl })
      return
    }

    console.log("HLS Player: [INIT] URL:", streamUrl)
    const video = videoRef.current

    // Reset error state
    setError(null)
    setIsBuffering(true)

    if (HLS.isSupported()) {
      console.log("HLS Player: Using hls.js")
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }

      const hls = new HLS({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
      })

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(HLS.Events.MANIFEST_PARSED, (_, data) => {
        console.log("HLS Player: Manifest parsed", { levels: data.levels.length })
        setQualityLevels(data.levels.map((l, i) => ({ id: i, height: l.height })))
        if (config.autoPlay) {
          video.play().catch(e => {
            console.warn("HLS Player: Autoplay blocked, waiting for user interaction", e)
          })
        }
      })

      hls.on(HLS.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS Player: Fatal error", data.type, data.details)
          switch (data.type) {
            case HLS.ErrorTypes.NETWORK_ERROR:
              console.log("HLS Player: Network error, trying to recover...")
              hls.startLoad()
              break
            case HLS.ErrorTypes.MEDIA_ERROR:
              console.log("HLS Player: Media error, trying to recover...")
              hls.recoverMediaError()
              break
            default:
              console.error("HLS Player: Unrecoverable error")
              setError(`Erreur de flux: ${data.details}`)
              hls.destroy()
              break
          }
        }
      })

      hlsRef.current = hls
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("HLS Player: Using native HLS (Safari)")
      video.src = streamUrl
      video.addEventListener("loadedmetadata", () => {
        if (config.autoPlay) video.play().catch(console.warn)
      })
    } else {
      console.error("HLS Player: Not supported in this browser")
      setError("Votre navigateur ne supporte pas la lecture HLS.")
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
    console.log("HLS Player: togglePlay called. Current state:", { isPlaying, hasVideoRef: !!videoRef.current })
    if (videoRef.current) {
      if (isPlaying) {
        console.log("HLS Player: Pausing")
        videoRef.current.pause()
      } else {
        console.log("HLS Player: Playing")
        videoRef.current.play().catch(e => console.error("HLS Player: Play failed", e))
      }
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen().catch(console.error)
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(console.error)
      setIsFullscreen(false)
    }
  }

  const togglePiP = () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(console.error)
      setIsPiP(false)
    } else if (videoRef.current) {
      videoRef.current.requestPictureInPicture().catch(console.error)
      setIsPiP(true)
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
    isFullscreen,
    isPiP,
    isLive,
    togglePlay,
    setQuality,
    seek,
    changeVolume,
    toggleMute,
    toggleFullscreen,
    togglePiP
  }
}
