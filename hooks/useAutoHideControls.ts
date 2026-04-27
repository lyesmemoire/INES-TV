import { useState, useRef, useCallback, useEffect } from "react"

export function useAutoHideControls(
  isPlaying: boolean,
  delay = 3000
) {
  const [showControls, setShowControls] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const show = useCallback(() => {
    setShowControls(true)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    if (isPlaying) {
      timeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, delay)
    }
  }, [isPlaying, delay])

  const hide = useCallback(() => {
    setShowControls(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { showControls, show, hide }
}
