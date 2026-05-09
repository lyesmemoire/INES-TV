"use client"

import { useEffect, useState } from "react"

/**
 * 🛡️ SafeClient Component
 * Prevents hydration errors by only rendering children on the client.
 */
export default function SafeClient({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
