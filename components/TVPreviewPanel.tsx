"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import type { Channel } from "@/types/channel"

type TVPreviewPanelProps = {
  channel: Channel
  onClose: () => void
  onPlay: () => void
}

type FocusedButton = "play" | "back"

export default function TVPreviewPanel({ channel, onClose, onPlay }: TVPreviewPanelProps) {
  const [focusedButton, setFocusedButton] = useState<FocusedButton>("play")
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault()

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowRight":
          setFocusedButton(prev => (prev === "play" ? "back" : "play"))
          break

        case "Enter":
          if (focusedButton === "play") {
            onPlay()
          } else {
            onClose()
          }
          break

        case "Escape":
          onClose()
          break
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [focusedButton, onPlay, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl mx-8 bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-purple-600/10" />

        {/* Content */}
        <div className="relative p-12 space-y-8">
          
          {/* Logo */}
          <div className="relative h-40 w-full bg-black/40 rounded-2xl flex items-center justify-center overflow-hidden">
            {!imageError && channel.logo ? (
              <Image
                src={channel.logo}
                alt={channel.name}
                fill
                className="object-contain p-6"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-8xl">📺</div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {channel.live && (
              <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                LIVE NOW
              </div>
            )}

            <h2 className="text-5xl font-bold">{channel.name}</h2>
            <p className="text-xl text-gray-400">{channel.category}</p>

            {channel.description && (
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                {channel.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={onPlay}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg
                flex items-center gap-3
                transition-all transform
                ${
                  focusedButton === "play"
                    ? "bg-red-600 text-white scale-105 ring-4 ring-red-500/50 shadow-lg shadow-red-600/50"
                    : "bg-red-800 text-gray-300 hover:bg-red-700"
                }
              `}
            >
              <span className="text-2xl">▶</span>
              Watch Now
            </button>

            <button
              onClick={onClose}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg
                transition-all
                ${
                  focusedButton === "back"
                    ? "bg-gray-700 text-white ring-4 ring-gray-500/50"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }
                border border-gray-700
              `}
            >
              ← Back
            </button>
          </div>

          {/* Hints */}
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-gray-800 rounded border border-gray-700">
                ←/→
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-gray-800 rounded border border-gray-700">
                ⏎
              </kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-gray-800 rounded border border-gray-700">
                ESC
              </kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
