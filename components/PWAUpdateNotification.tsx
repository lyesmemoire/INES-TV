"use client";

import { useEffect, useState } from "react";

export default function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-3 rounded-2xl z-50 shadow-2xl flex items-center gap-4">
      <span className="text-sm font-bold">Mise à jour disponible</span>
      <button
        onClick={handleUpdate}
        className="bg-white text-blue-600 text-xs font-black px-3 py-1.5 rounded-xl hover:bg-blue-50 transition"
      >
        Actualiser
      </button>
    </div>
  );
}
