"use client";

import { useEffect } from "react";

type WistiaPlayerProps = {
  videoId: string;
  [key: string]: any;
};

export default function WistiaPlayer({ videoId, className }: WistiaPlayerProps) {
  useEffect(() => {
    // Inject the specific video's JSONP script
    const videoScript = document.createElement("script");
    videoScript.src = `https://fast.wistia.com/embed/medias/${videoId}.jsonp`;
    videoScript.async = true;
    document.body.appendChild(videoScript);

    // Inject the Wistia external API script
    const apiScript = document.createElement("script");
    apiScript.src = "https://fast.wistia.com/assets/external/E-v1.js";
    apiScript.async = true;
    document.body.appendChild(apiScript);

    return () => {
      // Cleanup scripts on unmount to prevent memory leaks
      if (document.body.contains(videoScript)) {
        document.body.removeChild(videoScript);
      }
      if (document.body.contains(apiScript)) {
        document.body.removeChild(apiScript);
      }
    };
  }, [videoId]);

  return (
    <div className={`w-full h-full relative ${className || ""}`}>
      <div className="wistia_responsive_padding" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
        <div className="wistia_responsive_wrapper" style={{ height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }}>
          <div
            className={`wistia_embed wistia_async_${videoId} videoFoam=true`}
            style={{ height: "100%", position: "relative", width: "100%" }}
          >
            <div className="wistia_swatch" style={{ height: "100%", left: 0, opacity: 0, overflow: "hidden", position: "absolute", top: 0, transition: "opacity 200ms", width: "100%" }}>
              <img src={`https://fast.wistia.com/embed/medias/${videoId}/swatch`} style={{ filter: "blur(5px)", height: "100%", objectFit: "contain", width: "100%" }} alt="" aria-hidden="true" onLoad={(e) => (e.currentTarget.parentElement!.style.opacity = "1")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
