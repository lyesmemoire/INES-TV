"use client";

import { motion } from "framer-motion";

export default function Subscribe() {
  return (
    <section className="py-24 text-center bg-white/5 border-y border-white/10">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-4xl font-bold"
      >
        All sports. One membership.
      </motion.h2>

      <p className="text-white/60 mt-3">
        Live & on demand in HD quality
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 bg-red-600 hover:bg-red-700 px-10 py-3 rounded-full font-semibold transition"
      >
        Start Subscription
      </motion.button>
    </section>
  );
}
