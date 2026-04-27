"use client"

import { useState } from "react"

export default function SearchBar({ channels, onResult }: any) {
  const [query, setQuery] = useState("")

  const handleSearch = (value: string) => {
    setQuery(value)

    const filtered = channels.filter((c: any) =>
      c.name.toLowerCase().includes(value.toLowerCase())
    )

    onResult(filtered)
  }

  return (
    <input
      className="w-full p-3 bg-zinc-900 text-white rounded-lg"
      placeholder="Search channels..."
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
