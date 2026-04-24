import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

// Removed static CATEGORIES array to use dynamic one from 'counts'

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
  counts: Record<string, number>;
}

export default function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  const { t } = useLanguage();
  
  const dynamicCategories = useMemo(() => {
    const keys = Object.keys(counts).filter(k => k !== 'Favoris');
    return ['Tout', ...keys.sort()];
  }, [counts]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {dynamicCategories.map((cat) => {
        const count = cat === 'Tout' 
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[cat] ?? 0);

        const isActive = active === cat;

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
              isActive
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            {cat === 'Tout' ? t('grid.all') : (cat === 'Favoris' ? t('grid.favorites') : cat)}
            {count > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-black/20 text-black/80' : 'bg-white/10 text-zinc-400'
              }`}>
                {count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="category-indicator"
                className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/40"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
