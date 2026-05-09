import Image from "next/image";

export function HeroSection() {
  return (
    <div className="relative w-full h-[85vh] flex items-end">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 w-2/3" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 to-transparent z-10 h-32" />
        
        <Image 
          src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop" 
          alt="Hero Background" 
          fill
          className="object-cover object-center opacity-80"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 px-4 md:px-8 lg:px-12 w-full max-w-[1400px] mb-24">
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
    </div>
  );
}
