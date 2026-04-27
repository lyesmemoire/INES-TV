import { useEffect } from "react"

type UseAutoScrollProps = {
  containerRef: React.RefObject<HTMLElement>
  focusedIndex: number
  columns: number
  itemHeight: number
}

export function useAutoScroll({
  containerRef,
  focusedIndex,
  columns,
  itemHeight,
}: UseAutoScrollProps) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const rowIndex = Math.floor(focusedIndex / columns)
    const targetY = rowIndex * itemHeight

    // Dynamic centering
    const containerHeight = container.clientHeight
    const scrollOffset = targetY - containerHeight / 2 + itemHeight / 2

    container.scrollTo({
      top: Math.max(0, scrollOffset),
      behavior: "smooth",
    })
  }, [focusedIndex, columns, itemHeight, containerRef])
}
