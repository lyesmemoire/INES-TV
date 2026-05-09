'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface Stream {
  id: string
  type: string
  url: string
}

export default function FTAPlayer({ streams }: { streams: Stream[] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!streams?.length || !videoRef.current) return

    const stream = streams[0]
    let hls: Hls | null = null

    if (stream.type === "M3U8") {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          manifestLoadingTimeOut: 5000,
          manifestLoadingMaxRetry: 1,
        })
        
        hls.loadSource(stream.url)
        hls.attachMedia(videoRef.current)

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network error. Retrying...")
                hls?.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error. Recovering...")
                hls?.recoverMediaError()
                break
              default:
                setError("Playback error.")
                hls?.destroy()
                break
            }
          }
        })
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = stream.url
      }
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ""
        videoRef.current.load()
      }
    }
  }, [streams])

  if (streams[0]?.type === "YOUTUBE") {
    // Extract video ID (naive approach for demo)
    const videoId = streams[0].url.split('v=')[1]?.split('&')[0] || streams[0].url.split('/').pop()
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-white p-4 text-center">
          <p>{error}</p>
        </div>
      )}
      <video 
        ref={videoRef} 
        controls 
        autoPlay 
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  )
}
