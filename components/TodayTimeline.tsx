"use client";

import { motion } from "framer-motion";

const slots = ["Now", "18:00", "20:00", "22:00"];

export default function TodayTimeline() {
  return (
    <section className="px-6 py-10">
      <h2 className="text-xl font-bold mb-4">Today</h2>

      <motion.div
        className="flex gap-4 overflow-x-auto pb-4"
        drag="x"
        dragConstraints={{ left: -200, right: 0 }}
      >
        {slots.map((s) => (
          <motion.div
            key={s}
            whileHover={{ scale: 1.05 }}
            className="min-w-[180px] bg-white/5 p-5 rounded-xl border border-white/10 cursor-grab active:cursor-grabbing"
          >
            <p className="text-white/60">{s}</p>
            <p className="font-semibold mt-2">Match Preview</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
