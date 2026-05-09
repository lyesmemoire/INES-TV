"use client";

import Image from "next/image";

export function CategoriesSection({ categories = [] }: { categories?: string[] }) {
  // If no categories provided, fallback to default DAZN ones
  const displayCategories = categories.length > 0 ? categories : [
    "Ligue 1 McDonald's", 
    "Bundesliga", 
    "Serie A", 
    "Saudi Pro League",
    "Jupiler Pro League",
    "NFL",
    "NBA",
    "PFL",
    "Women's Champions League"
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      <button className="whitespace-nowrap bg-white text-black px-4 py-1.5 rounded border border-white font-bold text-sm hover:bg-gray-200 transition">
        All Sports
      </button>
      {displayCategories.map((sport, i) => (
        <button key={sport} className="whitespace-nowrap bg-black/60 border border-gray-700 text-white px-4 py-1.5 rounded font-bold text-sm hover:border-gray-400 transition flex items-center gap-2">
          <div className="relative w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center text-[8px] overflow-hidden">
            <Image src={`https://picsum.photos/seed/${i}/20/20`} alt="" fill className="object-cover opacity-80"/>
          </div>
          {sport}
        </button>
      ))}
    </div>
  );
}
