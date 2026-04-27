"use client"

import { useEffect, useState } from "react"

export default function PWAUpdateNotification() {
  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Anti-hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !("serviceWorker" in navigator)) return

    let updateInterval: NodeJS.Timeout | null = null

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)

      // Check for updates every 60 seconds
      updateInterval = setInterval(() => {
        reg.update()
      }, 60000)
    })

    // Listen for controller change
    const handleControllerChange = () => {
      setShow(true)
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange)

    return () => {
      if (updateInterval) clearInterval(updateInterval)
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange)
    }
  }, [mounted])

  const update = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
    }
    window.location.reload()
  }

  if (!mounted || !show) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white rounded-xl p-4 shadow-2xl w-[320px] animate-slide-down">
      <h3 className="font-semibold mb-2">Update Available</h3>
      <p className="text-sm mb-3 opacity-90">
        A new version of StreamPerf is ready. Update now for the latest features.
      </p>

      <div className="flex gap-2">
        <button
          onClick={update}
          className="flex-1 bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Update Now
        </button>
        <button
          onClick={() => setShow(false)}
          className="px-4 text-white/80 hover:text-white transition"
        >
          Later
        </button>
      </div>
    </div>
  )
}
