"use client";

export default function MatchSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090b] animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative w-full" style={{ height: "min(56.25vw, 540px)" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10 space-y-4">
          <div className="flex gap-3">
            <div className="h-7 w-20 bg-white/5 rounded-full" />
            <div className="h-7 w-24 bg-white/5 rounded-full" />
          </div>
          <div className="h-12 w-2/3 bg-white/10 rounded-2xl" />
          <div className="flex gap-4">
            <div className="h-14 w-40 bg-white/5 rounded-2xl" />
            <div className="h-14 w-14 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Category Filter Skeleton */}
      <div className="px-6 md:px-12 mt-8">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-white/5 rounded-xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="px-6 md:px-12 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video bg-white/5 rounded-2xl" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-3 w-12 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
