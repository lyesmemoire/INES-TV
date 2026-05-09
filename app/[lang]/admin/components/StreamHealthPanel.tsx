"use client"

import React, { memo } from "react"

type Stream = {
  channelId: string
  status: string
  viewers: number
}

type StreamHealthPanelProps = {
  streams: Stream[]
}

function StreamHealthPanelComponent({ streams }: StreamHealthPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-600/20 text-green-400 border-green-600/30"
      case "degraded":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
      case "down":
        return "bg-red-600/20 text-red-400 border-red-600/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
    }
  }

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-6">Stream Health</h2>

      {streams.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No active streams
        </div>
      ) : (
        <div className="space-y-3">
          {streams.map((stream) => (
            <div
              key={stream.channelId}
              className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{stream.channelId}</div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(stream.status)}`}>
                  {stream.status.toUpperCase()}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{stream.viewers} viewers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const StreamHealthPanel = memo(StreamHealthPanelComponent)
export default StreamHealthPanel
