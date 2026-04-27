const SOURCES = [
  "https://source1.com/stream.m3u8",
  "https://source2.com/stream.m3u8",
  "https://backup.com/stream.m3u8"
]

export function getRotatedSource() {
  const index = Math.floor(Math.random() * SOURCES.length)
  return SOURCES[index]
}
