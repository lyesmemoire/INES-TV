"use client";

import { motion, useScroll } from "framer-motion";

export default function Header() {
  const { scrollY } = useScroll();

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50"
    >
      <motion.div
        className="flex justify-between items-center px-6 py-4 backdrop-blur-md bg-black/30 border-b border-white/10"
        animate={{
          paddingTop: scrollY.get() > 50 ? 10 : 16,
          paddingBottom: scrollY.get() > 50 ? 10 : 16,
        }}
      >
        <div className="text-red-600 font-bold text-2xl tracking-wide">
          DAZN
        </div>

        <nav className="hidden md:flex gap-8 text-sm text-white/70">
          {["Live", "Today", "Competitions", "My DAZN"].map((i) => (
            <span key={i} className="hover:text-white transition cursor-pointer">
              {i}
            </span>
          ))}
        </nav>

        <button className="bg-red-600 px-5 py-2 rounded-full text-sm hover:scale-105 transition">
          Subscribe
        </button>
      </motion.div>
    </motion.header>
  );
}
