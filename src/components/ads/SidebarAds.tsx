"use client";

export default function SidebarAds() {
  return (
    <aside className="hidden xl:flex flex-col gap-6 w-[300px] px-4 py-6">

      {/* SLOT 1 */}
      <div className="h-[250px] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        <iframe
          src="/ads/ad1.html"
          className="w-full h-full"
        />
      </div>

      {/* SLOT 2 */}
      <div className="h-[250px] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        <iframe
          src="/ads/ad2.html"
          className="w-full h-full"
        />
      </div>

    </aside>
  );
}
