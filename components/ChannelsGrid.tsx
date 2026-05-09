"use client"
import Image from "next/image"
import { useChannelsByCategory } from "@/src/hooks/useChannelsByCategory"

export default function ChannelsGrid() {
  const groups = useChannelsByCategory()

  return (
    <div className="space-y-10 p-6">
      {Object.entries(groups).map(([group, channels]) => (
        <div key={group}>
          <h2 className="text-xl mb-4 font-bold text-white">{group}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {channels.map((c) => (
              <div key={c.id} className="min-w-[150px] max-w-[150px] group cursor-pointer transition-transform hover:scale-105">
                <div className="relative w-full h-24">
                  <Image
                    src={c.logo || "/placeholder.png"}
                    alt={c.name}
                    fill
                    className="object-cover rounded shadow-lg border border-gray-800 group-hover:border-gray-500"
                  />
                </div>
                <p className="text-sm mt-2 text-gray-300 truncate group-hover:text-white">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
