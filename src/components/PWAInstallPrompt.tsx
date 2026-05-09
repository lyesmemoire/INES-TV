"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstallPrompt() {
  const [mounted, setMounted] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  // Anti-hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check localStorage dismiss
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed) {
      const daysSince = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShow(true), 10000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setShow(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [mounted])

  const install = async () => {
    if (!deferredPrompt) return
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'dismissed') {
        localStorage.setItem('pwa-dismissed', String(Date.now()))
      }
      
      setShow(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error("Install error:", error)
    }
  }

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('pwa-dismissed', String(Date.now()))
  }

  if (!mounted || !show || !deferredPrompt) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-2xl w-[320px] animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold">Install App</h3>
        <button
          onClick={dismiss}
          className="text-gray-500 hover:text-white transition"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Install INES TV for faster access and offline support.
      </p>

      <div className="flex gap-2">
        <button
          onClick={install}
          className="flex-1 bg-red-600 hover:bg-red-700 py-2.5 rounded-lg font-semibold transition"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          className="px-4 text-gray-400 hover:text-white transition"
        >
          Later
        </button>
      </div>
    </div>
  )
}
