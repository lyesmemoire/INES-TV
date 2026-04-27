import { useState, useCallback, useRef, useEffect } from "react"

type NavigationKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Enter" | "Escape"

type UseTVNavigationProps = {
  itemCount: number
  columns: number
  onSelect?: () => void
  onBack?: () => void
}

const DEBOUNCE_MS = 120 // Safe for all TV types
const STORAGE_KEY = "tv-focus-index"

export function useTVNavigation({
  itemCount,
  columns,
  onSelect,
  onBack,
}: UseTVNavigationProps) {
  // Restore focus from session
  const [focusedIndex, setFocusedIndex] = useState(() => {
    if (typeof window === "undefined") return 0
    const saved = sessionStorage.getItem(STORAGE_KEY)
    const index = saved ? Number(saved) : 0
    // Validate saved index
    return index >= 0 && index < itemCount ? index : 0
  })

  const lockRef = useRef(false)

  // Save focus to session
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < itemCount) {
      sessionStorage.setItem(STORAGE_KEY, String(focusedIndex))
    }
  }, [focusedIndex, itemCount])

  const handleKey = useCallback(
    (key: NavigationKey) => {
      // Input lock to prevent rapid presses
      if (lockRef.current) return
      lockRef.current = true

      setTimeout(() => {
        lockRef.current = false
      }, DEBOUNCE_MS)

      switch (key) {
        case "ArrowRight":
          setFocusedIndex(prev => {
            const currentRow = Math.floor(prev / columns)
            const next = prev + 1
            const nextRow = Math.floor(next / columns)

            // Prevent wrapping to next row
            if (nextRow > currentRow || next >= itemCount) {
              return prev
            }
            return next
          })
          break

        case "ArrowLeft":
          setFocusedIndex(prev => {
            const currentRow = Math.floor(prev / columns)
            const next = prev - 1
            const nextRow = Math.floor(next / columns)

            // Prevent wrapping to previous row
            if (nextRow < currentRow || next < 0) {
              return prev
            }
            return next
          })
          break

        case "ArrowDown":
          setFocusedIndex(prev => {
            const next = prev + columns
            return next >= itemCount ? prev : next
          })
          break

        case "ArrowUp":
          setFocusedIndex(prev => {
            const next = prev - columns
            return next < 0 ? prev : next
          })
          break

        case "Enter":
          onSelect?.()
          break

        case "Escape":
          onBack?.()
          break
      }
    },
    [itemCount, columns, onSelect, onBack]
  )

  return {
    focusedIndex,
    setFocusedIndex,
    handleKey,
  }
}
