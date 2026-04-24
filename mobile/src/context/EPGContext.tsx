"use client";

import { createContext, useRef, useState, useCallback } from "react";

export const EPGContext = createContext<any>(null);

export function EPGProvider({ children }: any) {
  const scrollX = useRef(0);
  const channelRefs = useRef<any[]>([]);

  const registerChannel = useCallback((ref: any) => {
    channelRefs.current.push(ref);
    return () => {
      channelRefs.current = channelRefs.current.filter((r) => r !== ref);
    };
  }, []);

  const syncScroll = useCallback((x: number, senderRef: any) => {
    scrollX.current = x;
    channelRefs.current.forEach((ref) => {
      if (ref !== senderRef && ref.scrollTo) {
        ref.scrollTo({ x, animated: false });
      }
    });
  }, []);

  return (
    <EPGContext.Provider value={{ scrollX, syncScroll, registerChannel }}>
      {children}
    </EPGContext.Provider>
  );
}
