"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

export default function ProPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [quality, setQuality] = useState(-1)

  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
      })

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play()
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setQuality(data.level)
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.warn("Stream error:", data)
      })

      return () => hls.destroy()
    } else {
      video.src = src
    }
  }, [src])

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={videoRef} controls className="w-full h-full" />

      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded mb-4">
        Quality: {quality === -1 ? "AUTO" : quality}
      </div>
    </div>
  )
}
