"use client";

import { Menu, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const HomeCarousels = dynamic(() => import("./HomeCarousels"), { ssr: false });

export default function HomeClient() {

  const filters = [
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
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-sans pb-20">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button className="text-white hover:text-gray-300 transition flex items-center justify-center">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="text-white font-black text-3xl tracking-tighter pr-4 italic">
            INES TV
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold tracking-wide">
            <Link href="/" className="text-yellow-400 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[2px] after:bg-yellow-400">
              Home
            </Link>
            <button className="text-white hover:text-gray-300 transition flex items-center gap-1">
              Sports <ChevronDown className="w-4 h-4" />
            </button>
            <Link href="/live" className="text-white hover:text-gray-300 transition">
              Live TV
            </Link>
            <Link href="/schedule" className="text-white hover:text-gray-300 transition">
              Schedule
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-white hover:text-gray-300 transition">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-[15px] font-bold text-white hover:text-gray-300 transition">
            Login
          </button>
          <button className="bg-white text-black px-4 py-1.5 rounded font-bold text-[15px] hover:bg-gray-200 transition">
            Sign up
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full h-[85vh] flex items-end">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 w-2/3" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 to-transparent z-10 h-32" />
          
          <Image 
            src="/hero-bg.jpg" 
            alt="Live Football" 
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 px-8 lg:px-12 w-full max-w-[1400px] mb-24">
          <h2 className="text-xl font-bold mb-1 tracking-wide">Live stream highlights on</h2>
          <div className="text-white font-black text-6xl tracking-tighter mb-4 italic">
            INES TV
          </div>
          <p className="text-[15px] text-gray-300 max-w-md mb-6 leading-relaxed font-medium">
            Watch highlights and top moments of matches.<br/>
            Subscribe and watch from your devices.
          </p>
          <button className="bg-white text-black px-8 py-3 rounded font-bold text-[15px] hover:bg-gray-200 transition">
            Watch Now
          </button>
        </div>
      </section>

      {/* FILTERS */}
      <section className="px-8 lg:px-12 mb-10 relative z-20 mt-[-40px]">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button className="whitespace-nowrap bg-white text-black px-4 py-1.5 rounded border border-white font-bold text-sm hover:bg-gray-200 transition">
            All Sports
          </button>
          {filters.map((sport, i) => (
            <button key={sport} className="whitespace-nowrap bg-black/60 border border-gray-700 text-white px-4 py-1.5 rounded font-bold text-sm hover:border-gray-400 transition flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center text-[8px] overflow-hidden">
                <img src={`https://picsum.photos/seed/${i}/20/20`} alt="" className="w-full h-full object-cover opacity-80"/>
              </div>
              {sport}
            </button>
          ))}
        </div>
      </section>

      <HomeCarousels />
    </div>
  );
}
