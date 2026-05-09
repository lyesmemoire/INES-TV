"use client"

import { memo, useState } from "react"
import { TVCard } from "@/components/TVCard"
import type { Channel } from "../../types"

function ChannelRow({
  title,
  channels,
  lang
}: {
  title: string
  channels: Channel[]
  lang: string
}) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  return (
    <section className="recommendation-row">
       <div className="recommendation-row__header">
        <h2 className="recommendation-row__title">
          {title}
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {channels.map(channel => (
          <div key={channel.id} style={{ minWidth: '280px', flexShrink: 0 }}>
            <TVCard 
              channel={channel} 
              focused={focusedId === channel.id}
              onFocus={() => setFocusedId(channel.id)}
              lang={lang}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(ChannelRow)
