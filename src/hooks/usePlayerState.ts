import { useState } from "react";
import { PlayerState, StreamData } from "../types/player";

export function usePlayerState(matchId?: string) {
  const [state, setState] = useState<PlayerState>({ status: "idle" });
  
  // State transitions (jamais de throw)
  const goToLoading = () => setState({ status: "loading" });
  const goToPlaying = (stream: StreamData) => 
    setState({ status: "playing", stream });
  const goToDegraded = (reason: string) => 
    setState({ status: "degraded", reason });
  const goToOffline = (count: number) => 
    setState({ status: "offline", retryCount: count });

  return { state, goToLoading, goToPlaying, goToDegraded, goToOffline };
}
