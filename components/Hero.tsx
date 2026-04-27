"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-[90vh] flex items-end">
      {/* background video */}
      <video
        autoPlay
        muted
        loop
        className="absolute w-full h-full object-cover opacity-60"
        src="/stadium.mp4"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* content */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-10 max-w-3xl"
      >
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-red-500 font-semibold"
        >
          ● LIVE NOW
        </motion.p>

        <h1 className="text-5xl md:text-7xl font-bold mt-3 leading-tight">
          Real Madrid vs Barcelona
        </h1>

        <p className="text-white/70 mt-3 text-lg">
          La Liga • 67’ • 2 - 1 intense match
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 bg-white text-black px-8 py-3 rounded-full font-medium"
        >
          Watch Live
        </motion.button>
      </motion.div>
    </section>
  );
}
