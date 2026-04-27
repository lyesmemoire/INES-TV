import { useState } from "react"
import type { Level } from "hls.js"

type Props = {
  qualities: Level[]
  currentQuality: number
  onSelect: (q: number) => void
}

export default function QualitySelector({
  qualities,
  currentQuality,
  onSelect,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition flex items-center gap-2"
        aria-label="Select video quality"
        aria-expanded={isOpen}
      >
        {currentQuality === -1 ? "Auto" : `${qualities[currentQuality]?.height}p`}
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-gray-900 rounded-lg shadow-xl border border-gray-700 min-w-[120px] overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                onSelect(-1)
                setIsOpen(false)
              }}
              className={`
                w-full px-4 py-2 text-left hover:bg-white/10 transition
                ${currentQuality === -1 ? "bg-red-600 font-semibold" : ""}
              `}
            >
              Auto
            </button>

            {qualities.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2 text-left hover:bg-white/10 transition
                  ${currentQuality === i ? "bg-red-600 font-semibold" : ""}
                `}
              >
                {q.height}p
                {q.bitrate && (
                  <span className="text-xs text-gray-400 ml-2">
                    {Math.round(q.bitrate / 1000)} kbps
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg 
      className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
    </svg>
  )
}
