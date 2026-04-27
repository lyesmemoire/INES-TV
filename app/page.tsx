import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./HomeClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-sans">
      <p className="text-gray-500 font-bold animate-pulse">Chargement d&apos;INES TV...</p>
    </div>
  )
});

export default function Page() {
  return <HomeClient />;
}
