"use client";

import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-zinc-900 border border-zinc-700 rounded-2xl p-5 z-50 shadow-2xl">
      <h4 className="text-white font-bold text-sm mb-1">Installer INES TV</h4>
      <p className="text-zinc-400 text-xs mb-4">Accédez à l&apos;app directement depuis votre écran d&apos;accueil.</p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-emerald-500 text-black text-xs font-black py-2 rounded-xl hover:bg-emerald-400 transition"
        >
          Installer
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-1 bg-zinc-800 text-zinc-400 text-xs font-bold py-2 rounded-xl hover:bg-zinc-700 transition"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
