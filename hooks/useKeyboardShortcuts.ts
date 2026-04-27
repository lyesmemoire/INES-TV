"use client"

import { useEffect } from "react"

interface ShortcutsConfig {
  onPlayPause: () => void
  onToggleFullscreen: () => void
  onToggleMute: () => void
  onVolumeUp: () => void
  onVolumeDown: () => void
  onSeekForward: () => void
  onSeekBackward: () => void
  onTogglePiP: () => void
}

export function useKeyboardShortcuts(config: ShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.code) {
        case "Space":
          e.preventDefault()
          config.onPlayPause()
          break
        case "KeyF":
          config.onToggleFullscreen()
          break
        case "KeyM":
          config.onToggleMute()
          break
        case "ArrowUp":
          e.preventDefault()
          config.onVolumeUp()
          break
        case "ArrowDown":
          e.preventDefault()
          config.onVolumeDown()
          break
        case "ArrowRight":
          config.onSeekForward()
          break
        case "ArrowLeft":
          config.onSeekBackward()
          break
        case "KeyP":
          config.onTogglePiP()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [config])
}
