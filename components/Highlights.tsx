"use client";

import { motion } from "framer-motion";

export default function Highlights() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-xl font-bold mb-6">Highlights</h2>

      <motion.div className="flex gap-6 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.08 }}
            className="min-w-[320px] h-[180px] bg-white/10 rounded-xl border border-white/10 flex items-end p-4 cursor-pointer"
          >
            <p className="font-semibold text-white/90">Highlight Moment {i}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
