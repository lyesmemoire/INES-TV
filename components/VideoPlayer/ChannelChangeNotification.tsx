import { useEffect, useState } from "react"
import type { Channel } from "@/types/channel"

type Props = {
  channel: Channel
  visible: boolean
}

export default function ChannelChangeNotification({ channel, visible }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [channel.id, visible])

  if (!show) return null

  return (
    <div className="absolute top-4 left-4 z-30 pointer-events-none animate-slide-in-left">
      <div className="bg-black/90 backdrop-blur-md rounded-xl px-5 py-3 border border-white/10 shadow-2xl max-w-sm">
        <div className="flex items-center gap-4">
          {/* Logo */}
          {channel.logo && (
            <div className="w-12 h-12 flex-shrink-0 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={channel.logo} 
                alt={channel.name}
                className="w-full h-full object-contain p-1"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-lg truncate">
              {channel.name}
            </div>
            <div className="text-sm text-gray-400">{channel.category}</div>
            {channel.live && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400 font-medium">LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
