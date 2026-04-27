"use client"

import { memo } from "react"
import ChannelCard from "./ChannelCard"
import type { Channel } from "../../types"

function ChannelRow({
  title,
  channels
}: {
  title: string
  channels: Channel[]
}) {
  return (
    <section className="px-6 md:px-16 mt-10">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        {title}
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {channels.map(channel => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </section>
  )
}

export default memo(ChannelRow)
