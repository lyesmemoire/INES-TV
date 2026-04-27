export default function Footer() {
  return (
    <footer className="px-6 py-10 text-white/60 text-sm">
      <div className="grid md:grid-cols-4 gap-6">
        <div>
          <p className="text-white font-bold text-xl">DAZN</p>
        </div>
        <div className="hover:text-white cursor-pointer transition">About</div>
        <div className="hover:text-white cursor-pointer transition">Legal</div>
        <div className="hover:text-white cursor-pointer transition">Help</div>
      </div>

      <p className="text-center mt-10 text-white/40">
        "Where sport lives in real time."
      </p>
      
      <p className="text-center mt-4 text-white/30 text-xs">
        © 2026 DAZN Premium Clone
      </p>
    </footer>
  );
}
