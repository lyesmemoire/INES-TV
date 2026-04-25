"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Channel } from "@/src/types";
import ChannelCard from "./ChannelCard";
import { motion } from "framer-motion";

interface Props {
  onSelect: (channel: Channel) => void;
  activeChannel: Channel | null;
}

// ✅ MOCK RECOMMENDATIONS (plus d'API)
const MOCK_RECOMMENDATIONS: Channel[] = [
  {
    id: "rec-1",
    name: "Juventus vs AC Milan",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Juventus_Logo.svg",
    thumbnail: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800",
    streamUrl: undefined,
    category: "football",
    homeLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Juventus_Logo.svg",
    awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
    score: "1-0",
    viewers: 67000 as any,
    isPremium: true,
    currentProgram: null,
    liveStats: { elapsedTime: "LIVE" } as any,
  },
  {
    id: "rec-2",
    name: "NBA All-Star Game",
    logo: "",
    thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    streamUrl: undefined,
    category: "basketball",
    homeLogo: undefined,
    awayLogo: undefined,
    score: "",
    viewers: 42000 as any,
    isPremium: false,
    currentProgram: null,
    liveStats: { elapsedTime: "LIVE" } as any,
  },
];

export default function RecommendationRow({ onSelect, activeChannel }: Props) {
  const [recommendations] = useState<Channel[]>(MOCK_RECOMMENDATIONS);

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight leading-none uppercase">
              Recommandé pour vous
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              Sélection personnalisée
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {recommendations.map((channel, i) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isActive={activeChannel?.id === channel.id}
            index={i}
            onClick={() => onSelect(channel)}
          />
        ))}
      </motion.div>
    </div>
  );
}
