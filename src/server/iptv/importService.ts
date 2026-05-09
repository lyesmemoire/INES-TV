import { parseM3U } from "@/src/lib/iptv/parseM3U"

export async function importFromM3ULink(url: string) {
  const res = await fetch(url)
  const text = await res.text()

  return parseM3U(text)
}

export async function importFromFile(file: File) {
  const text = await file.text()
  return parseM3U(text)
}
