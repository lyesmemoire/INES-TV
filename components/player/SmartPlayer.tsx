'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function SmartPlayer({ streams }: { streams: any[] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [index, setIndex] = useState(0)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!streams || !streams[index]) return

    const stream = streams[index]
    let hls: Hls | null = null

    const loadStream = () => {
      // Assuming stream.type is checked or it defaults to HLS. Adjust if needed.
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 30,
          lowLatencyMode: true,
        })

        hls.loadSource(stream.sourceUrl || stream.url) // Graceful fallback depending on data structure
        hls.attachMedia(videoRef.current!)

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            if (retry < 1) {
              setRetry(retry + 1)
            } else {
              setTimeout(() => {
                setRetry(0)
                setIndex(index + 1)
              }, 1000)
            }
          }
        })
      }
    }

    loadStream()

    return () => {
      if (hls) hls.destroy()
    }
  }, [index, retry, streams])

  if (!streams || !streams[index]) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-black text-white">
        Stream temporarily unavailable
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full rounded-xl"
    />
  )
}
