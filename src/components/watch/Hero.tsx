"use client";

import React, { useEffect, useState } from "react";
import { Play, Star, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Channel } from "@/src/types";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import VideoPlayer from "@/src/components/Player/Player";

interface Props {
  channel: Channel | null;
}

export default function Hero({ channel }: Props) {
  const { favorites, toggleFavorite } = useAuth();
  const { t } = useLanguage();
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    setShowPlayer(false);
    if (!channel) return;

    const timer = setTimeout(() => {
      setShowPlayer(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [channel?.id]);


  if (!channel) {
    return (
      <section
        className="relative w-full bg-zinc-950"
        style={{ height: "min(56.25vw, 540px)" }}
      />
    );
  }

  const isFav = favorites?.includes(channel.id) ?? false;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={channel.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full"
        style={{ height: "min(56.25vw, 540px)" }}
      >
        {/* VIDEO LAYER */}
        <div className="absolute inset-0 bg-black overflow-hidden">
          {channel.streamUrl ? (
            showPlayer ? (
              <VideoPlayer
                channelId={channel.id}
                currentChannel={channel}
                streamUrl={channel.streamUrl}
                poster={channel.thumbnail}
                onError={(msg) => console.error(msg)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Preparing stream...
                  </span>
                </div>
              </div>
            )
          ) : channel.thumbnail ? (
            <img
              src={channel.thumbnail}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
              <span className="text-zinc-600">No media available</span>
            </div>
          )}


          {/* GRADIENTS */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/40 pointer-events-none" />
        </div>

        {/* CONTENT OVERLAY */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10 md:pb-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* BADGES */}
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]" />
                {t("navbar.live")}
              </span>

              <span className="text-sm font-semibold text-zinc-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                {channel.category}
              </span>

              {channel.isPremium && (
                <span className="flex items-center gap-1.5 bg-gradient-to-br from-amber-400 to-orange-600 text-black text-[11px] font-black px-4 py-1.5 rounded-full uppercase shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                  <Star size={12} fill="black" />
                  PREMIUM
                </span>
              )}
            </div>

            {/* TITLE */}
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3 drop-shadow-2xl">
              {channel.name}
            </h1>

            {/* SCORE (IF MATCH) - ✅ SAFE IMG RENDERING */}
            {channel.score && channel.homeLogo && channel.awayLogo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mb-5 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl w-fit"
              >
                {/* ✅ ONLY RENDER IF VALID */}
                {channel.homeLogo && (
                  <img
                    src={channel.homeLogo}
                    alt="Home"
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span className="text-3xl font-black text-white tabular-nums">
                  {channel.score}
                </span>
                {channel.awayLogo && (
                  <img
                    src={channel.awayLogo}
                    alt="Away"
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* STATS */}
            <div className="flex items-center gap-5 text-xs mb-8 p-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full w-fit px-5">
              <span className="flex items-center gap-1.5 py-1">
                <Activity
                  size={14}
                  className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                />
                <span className="font-black text-white">{channel.viewers}</span>
              </span>
              <div className="w-px h-4 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                <span className="font-black text-blue-400 uppercase text-[9px]">
                  4K ULTRA
                </span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-4">
              <button className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
                <Play size={22} fill="currentColor" />
                <span className="uppercase tracking-widest text-xs">
                  {t("hero.watchNow")}
                </span>
              </button>

              <button
                onClick={() => toggleFavorite(channel.id, channel)}
                className={`flex items-center gap-3 font-black px-6 py-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
                  isFav
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/10"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                }`}
              >
                <Star size={20} className={isFav ? "fill-amber-500" : ""} />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
