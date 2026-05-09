import { Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function TrendingSection() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {[1,2,3,4,5,6].map(i => (
         <Link 
          href="/watch/bein_sport_1" 
          key={i} 
          className="card card--compact flex-shrink-0 group"
          style={{ minWidth: '320px', padding: 'var(--space-4)' }}
         >
            <div className="card-media mb-2 relative aspect-video">
               <Image 
                src={`https://images.unsplash.com/photo-1551280857-2b9bbe5240f5?q=80&w=600&auto=format&fit=crop&sig=${i}`} 
                fill
                className="group-hover:scale-105 transition duration-500 object-cover" 
                alt="Thumbnail" 
               />
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/50 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                     <Play className="w-5 h-5 text-white group-hover:text-black ml-1 transition-colors duration-300" />
                  </div>
               </div>

               <div className="absolute top-2 left-2">
                  <span className="card-tag" style={{ backgroundColor: 'var(--color-action-danger)' }}>Live</span>
               </div>

               <div className="absolute bottom-0 left-0 h-1 bg-red-600 w-2/3" />
            </div>
            <div className="card-content">
              <h4 className="card-title">Real Madrid vs Barcelona</h4>
              <p className="card-body">LaLiga Highlights</p>
            </div>
         </Link>
      ))}
    </div>
  );
}
