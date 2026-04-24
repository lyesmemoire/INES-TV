import { useState, useCallback } from "react";
import { Channel } from "../types";

export const usePlayer = (channels: Channel[], initialId: string) => {
  const initialIndex = channels.findIndex(c => c.id === initialId);
  const [index, setIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const next = useCallback(() => {
    if (!channels.length) return;
    setIndex((prev) => (prev + 1) % channels.length);
  }, [channels.length]);

  const prev = useCallback(() => {
    if (!channels.length) return;
    setIndex((prev) => (prev - 1 + channels.length) % channels.length);
  }, [channels.length]);

  const zapTo = useCallback((id: string) => {
    const newIdx = channels.findIndex(c => c.id === id);
    if (newIdx >= 0) setIndex(newIdx);
  }, [channels]);

  return {
    currentChannel: channels[index] || null,
    nextChannel: channels[(index + 1) % channels.length] || null,
    prevChannel: channels[(index - 1 + channels.length) % channels.length] || null,
    index,
    next,
    prev,
    zapTo
  };
};
