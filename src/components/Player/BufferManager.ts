import Hls from "hls.js";
import { StreamSource } from "@/src/types";

let preloadHls: Hls | null = null;
let preloadedUrl: string | null = null;

export const selectInitialSource = (sources: StreamSource[]): StreamSource => {
  return [...sources].sort((a, b) => (a.priority || 0) - (b.priority || 0))[0];
};

export const getNextSource = (
  sources: StreamSource[],
  currentUrl: string
): StreamSource | null => {
  const sorted = [...sources].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  const index = sorted.findIndex((s) => s.url === currentUrl);

  if (index === -1 || index + 1 >= sorted.length) return null;

  const next = sorted[index + 1];

  console.info("[Stream Switch]", {
    from: sorted[index]?.cdn,
    to: next?.cdn,
  });

  return next;
};

export const preloadSource = (source: StreamSource) => {
  if (!source?.url) return;

  // éviter reload inutile
  if (preloadedUrl === source.url) return;

  // cleanup ancien preload
  if (preloadHls) {
    preloadHls.destroy();
    preloadHls = null;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      lowLatencyMode: true,
    });

    hls.loadSource(source.url);

    // 🚫 pas de attachMedia → preload uniquement
    preloadHls = hls;
    preloadedUrl = source.url;

    console.info("[Preload] Warming stream:", source.url);
  }
};

export const clearPreload = () => {
  if (preloadHls) {
    preloadHls.destroy();
    preloadHls = null;
    preloadedUrl = null;
  }
};
