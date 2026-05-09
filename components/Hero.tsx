"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="hero">
      {/* Background Media */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="hero__video"
        src="/stadium.mp4"
      />

      {/* Visual Overlay */}
      <div className="hero__overlay" />

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero__content"
      >
        <div className="hero__status">
          <span className="hero__status-dot" />
          <span>LIVE NOW</span>
        </div>

        <h1 className="hero__title">
          Real Madrid vs Barcelona
        </h1>

        <p className="hero__description">
          Accédez au streaming haute qualité de La Liga. Match intense à la 67ème minute.
        </p>

        <div className="hero__actions">
          <button className="btn btn--primary">
            Regarder en Direct
          </button>

          <button className="btn btn--secondary">
            Voir les Offres
          </button>
        </div>
      </motion.div>
    </section>
  );
}
