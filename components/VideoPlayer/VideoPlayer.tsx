"use client"

import dynamic from "next/dynamic"
import { useMemo, useRef, useEffect, useState, useCallback } from "react"
import Hls from "hls.js"
import SafeClient from "@/components/SafeClient"

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false })

export type StreamSource = {
  id: string
  url: string
  type: "facebook" | "m3u8" | "youtube" | "mp4" | "rtmp" | "hls" | "dash" | "xtream"
  quality_score?: number
}

export function VideoPlayer({
  url,
  sources = [],
  poster,
  channelId,
}: {
  url: string
  sources?: StreamSource[]
  poster?: string
  channelId?: string
}) {
  const [index, setIndex] = useState(0)
  const [loadBalancedSources, setLoadBalancedSources] = useState<StreamSource[]>([])
  const [proxyToken, setProxyToken] = useState<string>("")
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [bufferingCount, setBufferingCount] = useState(0)
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 🎯 LOAD BALANCER
  useEffect(() => {
    if (!channelId) return

    async function load() {
      try {
        const res = await fetch(`/api/stream/best/${channelId}`)
        if (!res.ok) return

        const data = await res.json()
        if (data.primary) {
          const mapped: StreamSource[] = [data.primary, ...(data.fallback || [])].map(
            (s: any) => ({
              id: s.id,
              url: s.url,
              type: "m3u8" as const,
              quality_score: s.score ?? s.healthScore ?? 0.5,
            })
          )
          setLoadBalancedSources(mapped)
        }
      } catch (e) {
        console.warn("[VideoPlayer] Load balancer fetch failed", e)
      }
    }

    load()
  }, [channelId])

  // 🔥 SORTING
  const allSources = useMemo(() => {
    const list = loadBalancedSources.length > 0 ? [...loadBalancedSources] : [...sources]
    return list.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
  }, [sources, loadBalancedSources])

  const currentSource = allSources[index]
  const currentRawUrl = currentSource?.url || url

  // 🛡️ FETCH JWT TOKEN FOR PROXY
  useEffect(() => {
    if (!currentRawUrl) return
    const isSocial = currentRawUrl.includes("youtube.com") || currentRawUrl.includes("youtu.be") || currentRawUrl.includes("facebook.com")
    const isTrusted = currentRawUrl.includes("mux.dev") || currentRawUrl.includes("cloudflare") || currentRawUrl.includes("google") || currentRawUrl.includes("freetv.fun")
    
    if (isSocial || isTrusted) {
      setCurrentUrl(currentRawUrl)
      return
    }

    async function fetchToken() {
      try {
        const res = await fetch(`/api/token?url=${encodeURIComponent(currentRawUrl)}`)
        const data = await res.json()
        if (data.token) {
          setProxyToken(data.token)
          setCurrentUrl(`/api/proxy?url=${encodeURIComponent(currentRawUrl)}&token=${data.token}`)
        }
      } catch (e) {
        console.error("Failed to fetch proxy token", e)
      }
    }

    fetchToken()
  }, [currentRawUrl])

  // 📡 TÉLÉMÉTRIE QoE
  const sendQoE = useCallback(async (type: string, value = 0) => {
    if (!channelId) return
    try {
      await fetch("/api/qoe", {
        method: "POST",
        body: JSON.stringify({
          channel_id: channelId,
          event_type: type,
          value
        })
      })
    } catch {}
  }, [channelId])

  const handleSourceError = useCallback(() => {
    sendQoE("error")
    if (index < allSources.length - 1) {
      console.log(`Stream failed, switching to source ${index + 1}`)
      setIndex(prev => prev + 1)
      setBufferingCount(0)
    }
  }, [index, allSources, sendQoE])

  const handleWaiting = useCallback(() => {
    sendQoE("buffer_start")
    setBufferingCount(prev => {
      const newCount = prev + 1
      // ⚡ Smart Auto Switch if buffering too much
      if (newCount > 3) {
        console.warn("Too much buffering, auto-switching source")
        handleSourceError()
        return 0
      }
      return newCount
    })
  }, [sendQoE, handleSourceError])

  const handlePlaying = useCallback(() => {
    sendQoE("buffer_end")
  }, [sendQoE])

  const type = useMemo(() => {
    if (!currentRawUrl) return "other"
    const lower = currentRawUrl.toLowerCase()
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube"
    if (lower.includes("facebook.com") || lower.includes("fb.watch") || lower.includes("fb.gg")) return "facebook"
    if (lower.includes(".m3u8") || lower.includes("/live/")) return "hls"
    return "other"
  }, [currentRawUrl])

  if (!currentUrl) {
    return <div className="w-full aspect-video bg-black rounded-3xl animate-pulse flex items-center justify-center text-white/50">Chargement du flux sécurisé...</div>
  }

  return (
    <SafeClient fallback={<div className="w-full aspect-video bg-black rounded-3xl animate-pulse" />}>
      <div className="relative w-full aspect-video group">
        {type === "youtube" || type === "facebook" ? (
          <div className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <ReactPlayer
              url={currentUrl}
              controls
              width="100%"
              height="100%"
              playing
              muted={false}
              onError={handleSourceError}
              onBuffer={handleWaiting}
              onBufferEnd={handlePlaying}
            />
          </div>
        ) : type === "hls" ? (
          <HLSPlayer 
            url={currentUrl} 
            poster={poster} 
            onError={handleSourceError} 
            onWaiting={handleWaiting}
            onPlaying={handlePlaying}
            sendQoE={sendQoE}
            bufferTimeoutRef={bufferTimeoutRef}
          />
        ) : (
          <div className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <iframe
              src={currentUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              onError={handleSourceError}
            />
          </div>
        )}
      </div>
    </SafeClient>
  )
}

function HLSPlayer({ url, poster, onError, onWaiting, onPlaying, sendQoE, bufferTimeoutRef }: any) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // ❄️ DETECTION FREEZE SILENCIEUX
  useEffect(() => {
    let lastTime = 0
    let freezeTimer: NodeJS.Timeout

    const interval = setInterval(() => {
      const video = videoRef.current
      if (!video) return

      if (video.currentTime === lastTime && !video.paused) {
        freezeTimer = setTimeout(() => {
          sendQoE("freeze_detected")
          if (onError) onError()
        }, 3000)
      } else {
        clearTimeout(freezeTimer)
      }

      lastTime = video.currentTime
    }, 2000)

    return () => clearInterval(interval)
  }, [url, sendQoE, onError])

  useEffect(() => {
    if (!videoRef.current) return
    const video = videoRef.current

    video.preload = "auto"

    const localHandleWaiting = () => {
      if (onWaiting) onWaiting()
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current)
      bufferTimeoutRef.current = setTimeout(() => {
        if (onError) onError()
      }, 3000)
    }

    const localHandlePlaying = () => {
      if (onPlaying) onPlaying()
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current)
    }

    video.addEventListener("waiting", localHandleWaiting)
    video.addEventListener("playing", localHandlePlaying)
    
    let hls: Hls | null = null
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        initialLiveManifestSize: 1,
        manifestLoadingMaxRetry: 10,
        manifestLoadingRetryDelay: 500,
        levelLoadingMaxRetry: 10,
        fragLoadingMaxRetry: 10,
      })
      
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal && onError) onError()
      })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url
    }

    return () => {
      video.removeEventListener("waiting", localHandleWaiting)
      video.removeEventListener("playing", localHandlePlaying)
      if (hls) hls.destroy()
      if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current)
    }
  }, [url, onError, onWaiting, onPlaying])

  return (
    <div className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative">
      <video 
        ref={videoRef} 
        controls 
        poster={poster}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-contain" 
      />
    </div>
  )
}
