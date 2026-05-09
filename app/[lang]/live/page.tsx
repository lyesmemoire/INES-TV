"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Tv, ChevronLeft } from "lucide-react";
import type { Channel } from "@/types/channel";
import SafeClient from "@/components/SafeClient";
import { TVCard, TVCardSkeleton } from "@/components/TVCard";

export default function LiveTVPage({ params }: { params: { lang: string } }) {
  return (
    <SafeClient fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-base)' }} />}>
       <LiveTVContent lang={params.lang} />
    </SafeClient>
  );
}

function LiveTVContent({ lang }: { lang: string }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/channels")
      .then((res) => res.json())
      .then((data: Channel[]) => {
        if (Array.isArray(data)) {
          setChannels(data);
          const uniqueCategories = Array.from(new Set(data.map((c) => c.category))).sort();
          setCategories(["All", ...uniqueCategories]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching channels:", err);
        setLoading(false);
      });
  }, []);

  const filteredChannels = channels.filter((channel) => {
    const matchesCategory = selectedCategory === "All" || channel.category === selectedCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}
    >
      {/* HEADER */}
      <header className="nav-bar sticky top-0 w-full z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="link flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline" style={{ fontSize: 'var(--font-size-sm)' }}>Retour</span>
          </Link>
          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--color-surface-raised)' }} className="hidden sm:block" />
          <Link href="/" className="italic flex items-center gap-2" style={{ fontWeight: 900, letterSpacing: '-0.05em', fontSize: 'var(--font-size-md)' }}>
            <Tv className="w-5 h-5" style={{ color: 'var(--color-action-primary)' }} />
            INES TV
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-inverse)' }} />
            <input
              type="text"
              placeholder="Rechercher une chaîne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 'var(--space-8)' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ color: 'var(--color-text-inverse)' }}
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            className="lg:hidden p-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ color: 'var(--color-text-inverse)' }}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <aside 
          className={`absolute lg:static inset-y-0 left-0 w-72 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{ 
            backgroundColor: 'var(--color-surface-strong)', 
            borderRight: '1px solid var(--color-surface-raised)' 
          }}
        >
          <div className="p-8">
            <h2 
              className="uppercase"
              style={{ 
                fontSize: 'var(--font-size-xs)', 
                fontWeight: 900, 
                letterSpacing: '0.1em', 
                color: 'var(--color-text-inverse)',
                marginBottom: 'var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <Filter className="w-4 h-4" />
              Catégories
            </h2>
            <div className="flex flex-col gap-2 overflow-y-auto h-[calc(100vh-160px)] pr-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className="text-left"
                  style={{
                    padding: 'var(--space-4) var(--space-5)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedCategory === cat ? 'var(--color-action-primary)' : 'transparent',
                    color: selectedCategory === cat ? 'var(--color-text-tertiary)' : 'var(--color-text-inverse)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{cat}</span>
                    {cat === "All" && (
                      <span 
                        style={{ 
                          fontSize: '10px', 
                          backgroundColor: selectedCategory === cat ? 'rgba(0,0,0,0.1)' : 'var(--color-surface-raised)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}
                      >
                        {channels.length}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {Array.from({ length: 18 }).map((_, i) => (
                <TVCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredChannels.map((channel) => (
                <TVCard 
                  key={channel.id}
                  channel={channel}
                  focused={focusedId === channel.id}
                  onFocus={() => setFocusedId(channel.id)}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--color-surface-raised)' }}
              >
                <Search className="w-8 h-8" style={{ color: 'var(--color-text-inverse)' }} />
              </div>
              <h3 className="hero__title" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>Aucune chaîne trouvée</h3>
              <p style={{ color: 'var(--color-text-inverse)' }}>
                Essayez d'ajuster vos filtres de recherche.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
