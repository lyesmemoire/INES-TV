import { useState, useCallback } from "react"

type Channel = {
  id: string
  name: string
  logo: string
  streamUrl: string
}

export function useChannelZapping(channels: Channel[], initialChannelId?: string) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialChannelId) {
      return channels.findIndex(ch => ch.id === initialChannelId)
    }
    return 0
  })

  const currentChannel = channels[currentIndex]

  const nextChannel = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % channels.length)
  }, [channels.length])

  const previousChannel = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + channels.length) % channels.length)
  }, [channels.length])

  const goToChannel = useCallback((channelId: string) => {
    const index = channels.findIndex(ch => ch.id === channelId)
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [channels])

  return {
    currentChannel,
    currentIndex,
    nextChannel,
    previousChannel,
    goToChannel,
  }
}
