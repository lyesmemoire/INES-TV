"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useChannelSearch } from "@/src/hooks/useChannelSearch"
import { useLanguage } from "@/src/context/LanguageContext"
import { Search, Loader2, X, Play } from "lucide-react"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const { results, loading } = useChannelSearch(query)
  const { language } = useLanguage()
  const router = useRouter()

  const handleSelect = (c: any) => {
    const suffix = language === 'fr' ? '-direct' : '-live';
    const href = c.slug 
      ? `/${language}/tv/${c.slug}${suffix}`
      : `/${language}/watch/${c.id}`;
    
    router.push(href);
    setQuery("");
  }

  return (
    <div className="relative w-full group">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
        <input
          placeholder="Rechercher un match ou une chaîne..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-600/50 focus:bg-white/10 transition-all"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        )}
      </div>
      
      {query && (
        <div 
          className="absolute top-full mt-2 w-full overflow-hidden z-[60] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
          style={{ maxHeight: '400px' }}
        >
          {loading && (
            <div className="p-8 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
              <p className="text-xs font-bold uppercase tracking-widest">Recherche en cours...</p>
            </div>
          )}
          
          {!loading && results.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-sm">Aucun résultat pour "<span className="text-white">{query}</span>"</p>
            </div>
          )}
          
          <div className="overflow-y-auto max-h-[350px] scrollbar-hide">
            {results.map((c) => (
              <button 
                key={c.id} 
                onClick={() => handleSelect(c)}
                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 group/item"
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-red-600/20 transition-colors">
                  <Play size={16} className="text-zinc-500 group-hover/item:text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{c.name}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{c.category || "Chaîne"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

