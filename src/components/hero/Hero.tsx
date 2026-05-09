"use client"

import Link from "next/link"
import type { Channel } from "@/src/types"

export default function Hero({ channel }: { channel?: Channel }) {
  if (!channel) return null

  return (
    <section className="relative h-[75vh] flex items-end">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={channel.logo}
          alt={channel.name}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-16 pb-16 max-w-2xl">

        <span className="inline-block bg-red-600 text-xs px-3 py-1 rounded-full mb-4 animate-pulse">
          LIVE
        </span>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          {channel.name}
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Watch in ultra low latency. Premium sports streaming experience.
        </p>

        <div className="flex gap-4 mt-6">
          <Link href={`/watch/${channel.id}`}>
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">
              ▶ Watch Now
            </button>
          </Link>

          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg">
            More Info
          </button>
        </div>

      </div>
    </section>
  )
}
