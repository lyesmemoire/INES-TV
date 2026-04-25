"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";

interface Props {
  active: string;
  onChange: (cat: string) => void;
  counts: Record<string, number>;
}

export default function CategoryFilter({ active, onChange, counts }: Props) {
  const { t } = useLanguage();

  const categories = useMemo(() => {
    // ✅ FIX: Remove "Tout" from counts before adding it manually
    const keys = Object.keys(counts).filter((k) => k !== "Tout" && k !== "Favoris");
    return ["Tout", ...keys.sort()];
  }, [counts]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
      {categories.map((cat) => {
        // ✅ FIX: Calculate count properly
        const count =
          cat === "Tout"
            ? Object.entries(counts)
                .filter(([k]) => k !== "Tout")
                .reduce((sum, [, v]) => sum + v, 0)
            : counts[cat] ?? 0;

        const isActive = active === cat;

        return (
          <button
            key={cat} // ✅ Now unique
            onClick={() => onChange(cat)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
              isActive
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            {cat === "Tout" ? t("grid.all") : cat}
            {count > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  isActive ? "bg-black/20 text-black/80" : "bg-white/10 text-zinc-400"
                }`}
              >
                {count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="category-indicator"
                className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/40"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
