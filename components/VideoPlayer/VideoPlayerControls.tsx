import { HLSPlayerState } from "@/hooks/useHLSPlayer"
import QualitySelector from "./QualitySelector"
import type { Channel } from "@/types/channel"

type VideoPlayerControlsProps = {
  state: HLSPlayerState
  controls: any
  currentChannel: Channel
  visible: boolean
  onShowGuide: () => void
}

export default function VideoPlayerControls({
  state,
  controls,
  currentChannel,
  visible,
  onShowGuide,
}: VideoPlayerControlsProps) {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "LIVE"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const bufferedPercent = state.duration
    ? (state.buffered / state.duration) * 100
    : 0

  const progressPercent = state.duration
    ? (state.currentTime / state.duration) * 100
    : 0

  return (
    <div
      className={`
        absolute bottom-0 left-0 right-0 z-20
        bg-gradient-to-t from-black via-black/80 to-transparent
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      {/* PROGRESS BAR */}
      {!state.isLive && (
        <div 
          className="relative h-1 bg-gray-700 cursor-pointer hover:h-2 transition-all group/progress"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            controls.seek(percent * state.duration)
          }}
        >
          {/* Buffered */}
          <div
            className="absolute h-full bg-gray-500 opacity-50"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Progress */}
          <div
            className="absolute h-full bg-red-600"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* CONTROLS */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3">
          
          {/* Play/Pause */}
          <button
            onClick={controls.togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
            aria-label={state.isPlaying ? "Pause" : "Play"}
          >
            {state.isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 group/volume">
            <button
              onClick={controls.toggleMute}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition"
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeMutedIcon />
              ) : (
                <VolumeIcon />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.volume}
              onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
              className="w-0 group-hover/volume:w-20 transition-all"
            />
          </div>

          {/* Time */}
          <div className="text-sm text-gray-300 font-mono">
            {formatTime(state.currentTime)}
            {!state.isLive && (
              <> / {formatTime(state.duration)}</>
            )}
          </div>

        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2">
          
          {/* Guide */}
          <button
            onClick={onShowGuide}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition"
            title="Guide (G)"
          >
            📺 Guide
          </button>

          {/* Quality */}
          {state.availableQualities && state.availableQualities.length > 1 && (
            <QualitySelector
              qualities={state.availableQualities}
              currentQuality={state.currentQuality}
              onSelect={controls.setQuality}
            />
          )}

          {/* PiP */}
          {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
            <button
              onClick={controls.togglePiP}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition"
              title="Picture-in-Picture (P)"
            >
              <PiPIcon active={state.isPiP} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={controls.toggleFullscreen}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition"
            title="Fullscreen (F)"
          >
            {state.isFullscreen ? (
              <ExitFullscreenIcon />
            ) : (
              <FullscreenIcon />
            )}
          </button>

        </div>
      </div>
    </div>
  )
}

// =====================
// ICONS
// =====================
function PlayIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
    </svg>
  )
}

function VolumeMutedIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  )
}

function ExitFullscreenIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>
  )
}

function PiPIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-red-500" : "text-white"}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/>
    </svg>
  )
}
