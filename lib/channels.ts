import type { Channel } from "@/types/channel"

export const channels: Channel[] = [
  {
    id: "beinsport1",
    name: "beIN Sports 1",
    category: "Football",
    logo: "/beinsport.png",
    live: true,
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: "espn",
    name: "ESPN",
    category: "Sports",
    logo: "/espn.png",
    live: true,
    streamUrl: "https://test-streams.mux.dev/test_001/stream.m3u8"
  }
]
