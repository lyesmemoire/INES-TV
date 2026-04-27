"use client";

import { motion } from "framer-motion";

const comps = ["UCL", "La Liga", "Serie A", "UFC"];

export default function Competitions() {
  return (
    <section className="px-6 py-16">
      <h2 className="text-xl font-bold mb-6">Competitions</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {comps.map((c) => (
          <motion.div
            key={c}
            whileHover={{
              rotateX: 8,
              rotateY: -8,
              scale: 1.05,
            }}
            className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-xl border border-white/10 cursor-pointer"
            style={{ perspective: 1000 }}
          >
            <p className="font-bold">{c}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
