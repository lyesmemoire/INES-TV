"use client"

import React, { useState, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2 } from "lucide-react"
import { useHLSPlayer } from "@/hooks/useHLSPlayer"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

interface VideoPlayerProps {
  streamUrl: string
  poster?: string
  title?: string
}

export default function VideoPlayer({ streamUrl, poster, title }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    videoRef,
    isPlaying,
    isBuffering,
    error,
    qualityLevels,
    currentQuality,
    duration,
    currentTime,
    volume,
    isMuted,
    togglePlay,
    setQuality,
    seek,
    changeVolume,
    toggleMute
  } = useHLSPlayer(streamUrl, { autoPlay: true })

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const togglePiP = async () => {
    if (!videoRef.current) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (e) {
      console.error("PiP failed:", e)
    }
  }

  useKeyboardShortcuts({
    onPlayPause: togglePlay,
    onToggleFullscreen: toggleFullscreen,
    onToggleMute: toggleMute,
    onVolumeUp: () => changeVolume(Math.min(volume + 0.1, 1)),
    onVolumeDown: () => changeVolume(Math.max(volume - 0.1, 0)),
    onSeekForward: () => seek(currentTime + 10),
    onSeekBackward: () => seek(currentTime - 10),
    onTogglePiP: togglePiP,
  })

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onClick={togglePlay}
        playsInline
      />

      {/* ERROR STATE */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">📺</div>
            <h3 className="text-xl font-black text-white mb-2">Signal Interrompu</h3>
            <p className="text-zinc-400 text-sm mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-all"
            >
              RÉESSAYER
            </button>
          </div>
        </div>
      )}

      {/* LOADING / BUFFERING */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-40">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* CONTROLS OVERLAY */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 flex flex-col justify-between ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        
        {/* Top Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-black font-black text-xs">SP</span>
            </div>
            <div>
                <h4 className="text-white font-black text-sm tracking-tight">{title || "En Direct"}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">LIVE</span>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-6 pt-0 space-y-4">
          
          {/* Progress Bar */}
          <div className="relative w-full h-1 bg-white/20 rounded-full group/bar cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pos = (e.clientX - rect.left) / rect.width
            seek(pos * duration)
          }}>
            <div 
                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full" 
                style={{ width: `${(currentTime / duration) * 100}%` }} 
            />
            <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/bar:scale-100 transition-transform"
                style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              <div className="flex items-center gap-3 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-emerald-400 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input 
                    type="range" min="0" max="1" step="0.1" value={volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-20 accent-emerald-500 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div className="text-[11px] font-black text-zinc-400 tracking-widest tabular-nums">
                {formatTime(currentTime)} <span className="opacity-30">/</span> {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`text-white hover:text-emerald-400 transition-colors ${showSettings ? "text-emerald-400" : ""}`}
                >
                  <Settings size={20} />
                </button>
                
                {/* Settings Menu */}
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-4 w-48 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-1">Qualité</div>
                    <button 
                        onClick={() => { setQuality(-1); setShowSettings(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentQuality === -1 ? "bg-emerald-500 text-black" : "text-zinc-300 hover:bg-white/5"}`}
                    >
                      <span>Automatique</span>
                      {currentQuality === -1 && <span className="text-[9px] font-black px-1.5 py-0.5 bg-black/10 rounded-md">AUTO</span>}
                    </button>
                    {qualityLevels.map((level) => (
                      <button 
                        key={level.id}
                        onClick={() => { setQuality(level.id); setShowSettings(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${currentQuality === level.id ? "bg-emerald-500 text-black" : "text-zinc-300 hover:bg-white/5"}`}
                      >
                        <span>{level.height}p</span>
                        {level.height >= 720 && <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-900/20 rounded-md">HD</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="text-white hover:text-emerald-400 transition-colors">
                {document.fullscreenElement ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
