import type { Channel } from "@/types/channel"

export default function TVStatusBar({ focusedChannel, totalChannels, currentIndex }: { focusedChannel: Channel, totalChannels: number, currentIndex: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent flex justify-between text-sm text-gray-400">
      <span>{focusedChannel ? focusedChannel.name : 'Ready'}</span>
      <span>{currentIndex + 1} / {totalChannels}</span>
    </div>
  )
}
