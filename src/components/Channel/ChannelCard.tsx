"use client"

import Link from "next/link"
import Image from "next/image"
import type { Channel } from "../../types"

export default function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link href={`/watch/${channel.id}`}>
      <div className="group relative min-w-[180px] md:min-w-[220px] h-[120px] rounded-xl overflow-hidden cursor-pointer">

        {/* Background */}
        <Image
          src={channel.logo}
          alt={channel.name}
          fill
          className="object-cover group-hover:scale-110 transition duration-300"
          sizes="(min-width: 768px) 220px, 180px"
          loading="lazy"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition" />

        {/* LIVE BADGE */}
        {channel.live && (
          <div className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-1 rounded-full">
            LIVE
          </div>
        )}

        {/* Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-semibold text-sm truncate">
            {channel.name}
          </p>
          <p className="text-xs text-gray-300">
            {channel.category}
          </p>
        </div>

      </div>
    </Link>
  )
}
