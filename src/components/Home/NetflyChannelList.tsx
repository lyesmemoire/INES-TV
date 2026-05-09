import { Channel } from '../../types';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface NetflyChannelListProps {
  channels: Channel[];
  onClose: () => void;
}

export default function NetflyChannelList({ channels, onClose }: NetflyChannelListProps) {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Netfly Header (Simulation) */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
            <ArrowLeft className="text-gray-400 group-hover:text-black" />
          </button>
          <div className="text-3xl font-black text-white" style={{ WebkitTextStroke: '1px #EF4444' }}>
            NETFLY
          </div>
        </div>
        <nav className="flex items-center gap-8 text-sm font-semibold text-gray-600">
          <a href="#" className="flex items-center gap-2 hover:text-black">
            NETFLY
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-black">
            NETFLY TV
          </a>
          <a href="#" className="flex items-center gap-2 text-red-500 relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
            TV Channels
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>
          </a>
        </nav>
      </header>

      {/* Hero Banner */}
      <div className="w-full bg-[#050514] py-24 relative overflow-hidden">
        <h1 className="text-center text-4xl md:text-5xl font-bold text-[#A855F7] relative z-10">
          Worldwide Channel list
        </h1>
        {/* Wavy subtle line emulation */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-[#A855F7] opacity-80 blur-[2px]"></div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Premium Network Row (e.g. CBS, Fox, beIN) */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-16 px-4">
          <div className="relative h-8 w-20 md:h-12 md:w-32">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CBS_logo.svg/200px-CBS_logo.svg.png" fill className="object-contain grayscale hover:grayscale-0 transition-all opacity-80" alt="CBS" />
          </div>
          <div className="relative h-8 w-20 md:h-12 md:w-32">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_Sports_logo.svg/200px-Fox_Sports_logo.svg.png" fill className="object-contain grayscale hover:grayscale-0 transition-all opacity-80" alt="FOX" />
          </div>
          <div className="relative h-6 w-24 md:h-10 md:w-40">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/BeIN_SPORTS_logo.svg/200px-BeIN_SPORTS_logo.svg.png" fill className="object-contain grayscale hover:grayscale-0 transition-all opacity-80" alt="beIN" />
          </div>
          <div className="relative h-8 w-16 md:h-12 md:w-24">
            <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/HBO_logo.svg/200px-HBO_logo.svg.png" fill className="object-contain grayscale hover:grayscale-0 transition-all opacity-80" alt="HBO" />
          </div>
        </div>

        {/* 10-Column Dense Icon Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4 justify-items-center">
          {channels.map((channel, i) => (
            <div 
              key={channel.id + i} 
              className="relative w-full aspect-square bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center border border-gray-100 p-2"
            >
              <Image 
                src={channel.thumbnail || "/placeholder.png"} 
                alt={channel.name}
                fill
                className="object-contain p-2"
              />
            </div>
          ))}
          {/* Duplicate to simulate large grid density just like Netfly */}
          {channels.map((channel, i) => (
            <div 
              key={channel.id + 'dup' + i} 
              className="relative w-full aspect-square bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center border border-gray-100 p-2"
            >
              <Image src={channel.thumbnail || "/placeholder.png"} alt={channel.name} fill className="object-contain p-2" />
            </div>
          ))}
          {channels.map((channel, i) => (
            <div 
              key={channel.id + 'dup2' + i} 
              className="relative w-full aspect-square bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-center border border-gray-100 p-2"
            >
              <Image src={channel.thumbnail || "/placeholder.png"} alt={channel.name} fill className="object-contain p-2" />
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-600 text-sm font-medium">
          * Note : This list is not including all channels we have, <span className="font-bold cursor-pointer hover:text-black">contact us</span> for more informations about the channel list.
        </div>
      </main>

      {/* Footer Platforms */}
      <footer className="bg-[#F8F9FA] py-12 mt-12 border-t border-gray-200 flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-6 items-center opacity-60">
          <span className="font-black text-xl">iOS</span>
          <span className="font-black text-xl">android</span>
          <span className="font-black text-xl">AirPlay</span>
          <span className="font-black text-xl">chromecast</span>
          <span className="font-black text-xl">Roku</span>
          <span className="font-black text-xl">Smart TV</span>
        </div>
      </footer>
    </div>
  );
}
