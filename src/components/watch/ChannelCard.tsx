"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Activity, Star } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { Channel } from "@/src/types";
import { getPrimaryStream } from "@/src/utils/streams/getPrimaryStream";
import VideoCore from "@/src/components/Player/VideoCore";
import { useAdTrigger } from "@/src/lib/ads/useAdTrigger";

interface Props {
  channel: Channel;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

export default function ChannelCard({
  channel,
  isActive,
  index,
  onClick,
}: Props) {
  const { favorites, toggleFavorite } = useAuth();
  const { onMatchClick } = useAdTrigger();
  const [isHovered, setIsHovered] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFav = (favorites || []).includes(channel.id);

  useEffect(() => {
    if (isHovered) {
      timeoutRef.current = setTimeout(() => setShowPreview(true), 800);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowPreview(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={() => {
        onMatchClick();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}

      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:z-10 ${
        isActive
          ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#09090b] shadow-[0_0_40px_rgba(16,185,129,0.25)]"
          : "hover:ring-1 hover:ring-white/20"
      }`}
    >
      {/* GLOW EFFECT */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent pointer-events-none z-10" />

      {/* THUMBNAIL */}
      <div className="aspect-video bg-zinc-900 relative overflow-hidden">
        {showPreview ? (
          (() => {
            const stream = getPrimaryStream(channel);
            return stream ? (
              <VideoCore src={stream.url} type={stream.type} />
            ) : (
              // ✅ FIX: Fallback to thumbnail if no stream
              channel.thumbnail ? (
                <img
                  src={channel.thumbnail}
                  alt={channel.name}
                  className="w-full h-full object-cover"
                />
              ) : null
            );
          })()
        ) : channel.homeLogo && channel.awayLogo ? (
          // Match card with logos
          <div className="absolute inset-0 flex items-center justify-center gap-4 p-4 bg-gradient-to-br from-zinc-900 to-zinc-950">
            {/* ✅ FIX: Only render img if src is valid */}
            {channel.homeLogo && (
              <img
                src={channel.homeLogo}
                alt="Home"
                className="w-14 h-14 object-contain drop-shadow-xl"
              />
            )}
            {channel.score ? (
              <span className="text-2xl font-black text-white tabular-nums">
                {channel.score}
              </span>
            ) : (
              <span className="text-sm font-black text-zinc-500">VS</span>
            )}
            {channel.awayLogo && (
              <img
                src={channel.awayLogo}
                alt="Away"
                className="w-14 h-14 object-contain drop-shadow-xl"
              />
            )}
          </div>
        ) : channel.thumbnail ? (
          // ✅ FIX: Only render if thumbnail exists
          <img
            src={channel.thumbnail}
            alt={channel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          // ✅ Fallback placeholder
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <span className="text-zinc-600 text-sm font-bold">No Image</span>
          </div>
        )}

        {/* PLAY OVERLAY */}
        {!showPreview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
              <Play size={20} fill="black" className="ml-0.5" />
            </div>
          </div>
        )}

        {/* BADGES */}
        <div className="absolute top-3 left-3 z-30">
          <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        </div>

        {channel.isPremium && (
          <div className="absolute bottom-3 right-3 z-30">
            <span className="flex items-center gap-1 bg-gradient-to-br from-amber-400 to-orange-600 text-black text-[9px] font-black px-2 py-0.5 rounded-md shadow-xl">
              <Star size={10} fill="black" />
              PREMIUM
            </span>
          </div>
        )}

        {/* FAVORITE */}
        <div className="absolute top-3 right-3 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(channel.id, channel);
            }}
            className="bg-black/40 hover:bg-black/80 backdrop-blur-md p-1.5 rounded-full transition-all hover:scale-110"
          >
            <Star
              size={16}
              className={`transition-colors ${
                isFav
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-zinc-300 hover:text-white"
              }`}
            />
          </button>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 bg-zinc-900/80 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-zinc-100 line-clamp-2 mb-2 group-hover:text-white transition-colors leading-snug">
          {channel.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase">
            {channel.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
            <Activity size={10} className="text-red-400" />
            {channel.viewers}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
