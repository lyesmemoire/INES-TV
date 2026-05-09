"use client"

import { useState, useEffect } from "react"
import type { Channel } from "@/types/channel"

type Props = {
  channels: Channel[]
  currentChannelId: string
  onSelectChannel: (id: string) => void
  onClose: () => void
}

export default function MiniGuide({
  channels,
  currentChannelId,
  onSelectChannel,
  onClose,
}: Props) {
  const [focusedIndex, setFocusedIndex] = useState(() => 
    channels.findIndex(ch => ch.id === currentChannelId)
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          setFocusedIndex(prev => Math.max(0, prev - 1))
          break

        case "ArrowDown":
          e.preventDefault()
          setFocusedIndex(prev => Math.min(channels.length - 1, prev + 1))
          break

        case "Enter":
          e.preventDefault()
          onSelectChannel(channels[focusedIndex].id)
          break

        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [focusedIndex, channels, onSelectChannel, onClose])

  // Auto-scroll to focused
  useEffect(() => {
    const element = document.getElementById(`channel-${focusedIndex}`)
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [focusedIndex])

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Channel Guide</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
            aria-label="Close guide"
          >
            ✕
          </button>
        </div>

        {/* Channels grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((ch, index) => (
            <button
              key={ch.id}
              id={`channel-${index}`}
              onClick={() => onSelectChannel(ch.id)}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`
                flex items-center gap-4 p-4 rounded-xl cursor-pointer
                transition-all duration-200
                ${index === focusedIndex
                  ? "bg-red-600 scale-105 ring-4 ring-red-500/50 shadow-xl"
                  : "bg-gray-800/50 hover:bg-gray-800"
                }
                ${ch.id === currentChannelId ? "ring-2 ring-white/20" : ""}
              `}
            >
              {/* Logo */}
              <div className="w-12 h-12 flex-shrink-0 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden">
                {ch.logo ? (
                  <img 
                    src={ch.logo} 
                    alt={ch.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-2xl">📺</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <div className="font-semibold">{ch.name}</div>
                {ch.id === currentChannelId && (
                  <div className="text-xs text-red-300 mt-1">
                    Currently playing
                  </div>
                )}
              </div>

              {/* Focus indicator */}
              {index === focusedIndex && (
                <div className="text-xs text-white/60">⏎</div>
              )}
            </button>
          ))}
        </div>

        {/* Keyboard hints */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">⏎</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
