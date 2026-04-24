"use client";

import React, { createContext, useRef } from "react";

export const EPGContext = createContext<any>(null);

export function EPGProvider({ children }: any) {
  const scrollRefs = useRef<any[]>([]);

  const registerScroll = (ref: any) => {
    if (ref && !scrollRefs.current.includes(ref)) {
      scrollRefs.current.push(ref);
    }
  };

  const syncScroll = (x: number, sourceRef: any) => {
    scrollRefs.current.forEach((ref) => {
      if (ref && ref !== sourceRef) {
        ref.scrollTo?.({ x, animated: false });
      }
    });
  };

  return (
    <EPGContext.Provider value={{ registerScroll, syncScroll }}>
      {children}
    </EPGContext.Provider>
  );
}
