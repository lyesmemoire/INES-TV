"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { TVErrorBoundary } from "@/components/TVErrorBoundary"
import TVCard from "@/components/TVCard"
import TVHeader from "@/components/TVHeader"
import TVStatusBar from "@/components/TVStatusBar"
import TVPreviewPanel from "@/components/TVPreviewPanel"
import TVHelpOverlay from "@/components/TVHelpOverlay"
import { useTVNavigation } from "@/hooks/useTVNavigation"
import { useAutoScroll } from "@/hooks/useAutoScroll"
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns"
import type { Channel } from "@/types/channel"

export default function TVMode() {
  return (
    <TVErrorBoundary>
      <TVModeContent />
    </TVErrorBoundary>
  )
}

function TVModeContent() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const gridRef = useRef<HTMLDivElement>(null)
  const columns = useResponsiveColumns()

  const { focusedIndex, setFocusedIndex, handleKey } = useTVNavigation({
    itemCount: channels.length,
    columns,
    onSelect: () => setShowPreview(true),
    onBack: () => {
      if (showPreview) {
        setShowPreview(false)
      } else {
        window.history.back()
      }
    },
  })

  useAutoScroll({
    containerRef: gridRef,
    focusedIndex,
    columns,
    itemHeight: 220, // card height + gap
  })

  // Load channels avec cache
  useEffect(() => {
    fetch("/api/channels", { 
      cache: 'force-cache',
      next: { revalidate: 60 }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load channels")
        return res.json()
      })
      .then(data => {
        setChannels(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Keyboard handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent default scroll behavior
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(e.key)) {
        e.preventDefault()
      }

      handleKey(e.key as any)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleKey])

  const focusedChannel = channels[focusedIndex]

  if (loading) {
    return <TVLoadingScreen />
  }

  if (error) {
    return <TVErrorScreen error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      
      <TVHeader channelCount={channels.length} />

      <div 
        ref={gridRef}
        className="px-10 py-8 overflow-y-auto max-h-[calc(100vh-180px)]"
        style={{ scrollBehavior: "smooth" }}
      >
        <div
          className="grid gap-6 transition-all duration-300"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          {channels.map((channel, index) => (
            <TVCard
              key={channel.id}
              channel={channel}
              focused={index === focusedIndex}
              onFocus={() => setFocusedIndex(index)}
            />
          ))}
        </div>

        {channels.length === 0 && (
          <TVEmptyState />
        )}
      </div>

      {showPreview && focusedChannel && (
        <TVPreviewPanel
          channel={focusedChannel}
          onClose={() => setShowPreview(false)}
          onPlay={() => (window.location.href = `/watch/${focusedChannel.id}`)}
        />
      )}

      <TVStatusBar
        focusedChannel={focusedChannel}
        totalChannels={channels.length}
        currentIndex={focusedIndex}
      />

      <TVHelpOverlay />
    </main>
  )
}

/* =====================
   LOADING SCREEN
===================== */
function TVLoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-4 border-4 border-red-400 border-b-transparent rounded-full animate-spin" 
               style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <h2 className="text-3xl font-semibold text-gray-300">Loading TV Mode...</h2>
        <p className="text-gray-500 text-lg">Preparing your channels</p>
      </div>
    </div>
  )
}

/* =====================
   ERROR SCREEN
===================== */
function TVErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="text-9xl mb-6 opacity-20">⚠️</div>
        <h1 className="text-4xl font-bold mb-4">Unable to Load TV Mode</h1>
        <p className="text-xl text-gray-400 mb-8">{error}</p>
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-red-600 rounded-xl font-bold text-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

/* =====================
   EMPTY STATE
===================== */
function TVEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-9xl mb-6 opacity-20">📺</div>
      <h2 className="text-4xl font-bold mb-4">No Channels Available</h2>
      <p className="text-xl text-gray-400 mb-8">Check back later for live content</p>
    </div>
  )
}
