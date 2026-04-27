import { useState, useEffect } from "react"

export function useResponsiveColumns() {
  const [columns, setColumns] = useState(() => getColumnsForWidth(
    typeof window !== "undefined" ? window.innerWidth : 1920
  ))

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnsForWidth(window.innerWidth))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return columns
}

function getColumnsForWidth(width: number): number {
  if (width >= 3840) return 7  // 4K
  if (width >= 2560) return 6  // QHD
  if (width >= 1920) return 5  // Full HD
  if (width >= 1280) return 4  // HD
  return 3                      // Fallback
}
