"use client"

import Hls from "hls.js"
import { useEffect, useRef } from "react"

export default function Player({ url }: { url: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(url)
      hls.attachMedia(ref.current)
    } else {
      ref.current.src = url
    }
  }, [url])

  return (
    <video
      ref={ref}
      controls
      className="w-full h-full bg-black"
      autoPlay
    />
  )
}
