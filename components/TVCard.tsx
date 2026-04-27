import Image from "next/image"
import { memo, useState } from "react"
import type { Channel } from "@/types/channel"

type TVCardProps = {
  channel: Channel
  focused: boolean
  onFocus: () => void
}

function TVCard({ channel, focused, onFocus }: TVCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      onMouseEnter={onFocus}
      className={`
        relative rounded-2xl p-5 cursor-pointer
        transition-all duration-300 ease-out
        ${
          focused
            ? "scale-110 z-20 ring-4 ring-red-500 shadow-2xl shadow-red-500/50 bg-gradient-to-br from-red-950/30 to-gray-900"
            : "bg-gray-900/40 hover:bg-gray-900/60 backdrop-blur-sm border border-gray-800"
        }
      `}
      style={{
        transform: focused ? "scale(1.1)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* LIVE BADGE */}
      {channel.live && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-md animate-pulse" />
            <div className="relative bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          </div>
        </div>
      )}

      {/* LOGO */}
      <div
        className={`
          relative h-32 flex items-center justify-center
          bg-black/60 rounded-xl overflow-hidden mb-4
          transition-all duration-300
          ${focused ? "ring-2 ring-red-500/50" : ""}
        `}
      >
        {!imageError && channel.logo ? (
          <Image
            src={channel.logo}
            alt={channel.name}
            fill
            className="object-contain p-3"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl opacity-40">📺</div>
        )}

        {focused && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent animate-fade-in" />
        )}
      </div>

      {/* INFO */}
      <div className="space-y-2">
        <h3
          className={`
            font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]
            transition-colors
            ${focused ? "text-white" : "text-gray-300"}
          `}
        >
          {channel.name}
        </h3>

        <div className="flex items-center justify-between">
          <p
            className={`
              text-sm font-medium
              ${focused ? "text-red-400" : "text-gray-500"}
            `}
          >
            {channel.category}
          </p>

          {focused && (
            <div className="text-xs text-gray-400 flex items-center gap-1 animate-fade-in">
              <span>Press</span>
              <kbd className="px-2 py-0.5 bg-gray-800 rounded border border-gray-700">
                ⏎
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* FOCUS INDICATORS */}
      {focused && (
        <>
          <div className="absolute inset-0 rounded-2xl border-2 border-red-500 animate-pulse pointer-events-none" />
          <div className="absolute -inset-1 rounded-2xl bg-red-500/20 blur-xl pointer-events-none animate-pulse" />
        </>
      )}
    </div>
  )
}

export default memo(TVCard)
