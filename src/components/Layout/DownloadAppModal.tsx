import React from 'react';
import { Smartphone, Tv, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Télécharger nos applications</h2>
                <p className="text-zinc-400 text-sm mt-1">L'expérience INES TV partout avec vous.</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Mobile App */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Application Mobile</h3>
                <p className="text-sm text-zinc-400 mb-6">Pour Android (Smartphone & Tablette).</p>
                
                {/* Fake QR Code */}
                <div className="w-32 h-32 bg-white rounded-xl mb-6 p-2 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <div className="w-full h-full border-4 border-dashed border-zinc-300 rounded-lg flex items-center justify-center text-zinc-400 text-xs font-bold font-mono text-center bg-zinc-50">
                    CODE QR<br/>PLACEHOLDER
                  </div>
                </div>

                <a
                  href="/apps/app-mobile.apk"
                  download
                  className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10 shadow-lg"
                >
                  <Download size={18} />
                  Télécharger (APK)
                </a>
              </div>

              {/* TV App */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                  <Tv size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Android TV</h3>
                <p className="text-sm text-zinc-400 mb-6 flex-1">Optimisée pour la télévision (Mi Box, Shield, TV). Naviguez avec la télécommande !</p>
                
                <div className="w-full relative z-10 mt-auto">
                  <a
                    href="/apps/app-tv.apk"
                    download
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"
                  >
                    <Download size={18} />
                    Télécharger (APK)
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
