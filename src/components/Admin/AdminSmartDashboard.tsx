import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Search, 
  Globe, 
  Tv, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Info,
  Youtube,
  Facebook,
  Twitch,
  Activity
} from "lucide-react";
import { detectStreamType, StreamType } from "../../utils/detectStreamType";
import { validateStream } from "../../utils/validateStream";
import VideoPlayer from "../Player/Player";

export default function AdminSmartDashboard() {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<StreamType>("unknown");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ ok: boolean; status: number } | null>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    const detected = detectStreamType(url);
    setType(detected);

    // 🎯 Generate Preview URL
    let finalPreview = url;
    if (detected === "youtube") {
      const videoId = url.includes("v=") ? url.split("v=")[1]?.split("&")[0] : url.split("/").pop();
      finalPreview = `https://www.youtube.com/embed/${videoId}`;
    } else if (detected === "facebook") {
      finalPreview = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    } else if (detected === "twitch") {
      const channel = url.split("twitch.tv/")[1];
      finalPreview = `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
    }
    
    setPreviewUrl(finalPreview);

    // ⚡ Validate Stream
    setIsValidating(true);
    const result = await validateStream(url);
    setValidationResult(result);
    setIsValidating(false);
  };

  const getPlatformIcon = (t: StreamType) => {
    switch (t) {
      case "youtube": return <Youtube size={20} className="text-red-500" />;
      case "facebook": return <Facebook size={20} className="text-blue-500" />;
      case "twitch": return <Twitch size={20} className="text-purple-500" />;
      case "hls": return <Tv size={20} className="text-indigo-400" />;
      default: return <Globe size={20} className="text-zinc-400" />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Zap size={24} className="text-indigo-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Admin <span className="text-indigo-400">Smart Dashboard</span></h2>
        </div>
        <p className="text-zinc-500 font-medium">Détection intelligente et validation de flux OTT en temps réel.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Search size={14} /> Analyseur de Flux
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Colle ton lien live (HLS, YT...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl p-4 text-sm text-white placeholder-zinc-700 transition-all outline-none"
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={!url || isValidating}
                className="w-full bg-white hover:bg-indigo-50 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {isValidating ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Activity size={18} />
                    Analyser le Flux
                  </>
                )}
              </button>
            </div>

            {type !== "unknown" && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-6 border-t border-zinc-800"
                >
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                            {getPlatformIcon(type)}
                            <span className="text-sm font-bold text-white uppercase tracking-wider">{type}</span>
                        </div>
                        {validationResult && (
                            <div className={`flex items-center gap-1.5 ${validationResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                {validationResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                <span className="text-[10px] font-black uppercase">{validationResult.ok ? 'Valide' : 'Erreur'}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
          </div>

          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
             <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Info size={16} />
                <h4 className="text-xs font-black uppercase tracking-widest">Guide Pro</h4>
             </div>
             <ul className="space-y-3 text-xs text-zinc-500 font-medium leading-relaxed">
                <li className="flex gap-2">
                    <span className="text-indigo-400/50">•</span> 
                    Flux HLS (.m3u8) recommandés pour une compatibilité UltraPlayer.
                </li>
                <li className="flex gap-2">
                    <span className="text-indigo-400/50">•</span> 
                    Les liens YouTube/Twitch sont encapsulés automatiquement.
                </li>
             </ul>
          </div>
        </div>

        {/* Right Column: Preview Area */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden min-h-[440px] flex flex-col">
             <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Play size={14} className="text-indigo-400" /> Prévisualisation Live
                </h3>
                {previewUrl && (
                    <a href={url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                        <ExternalLink size={14} />
                    </a>
                )}
             </div>

             <div className="flex-1 bg-black p-8 flex items-center justify-center relative group">
                <AnimatePresence mode="wait">
                    {previewUrl ? (
                        <motion.div 
                            key={previewUrl}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
                        >
                            {type === "hls" ? (
                                <VideoPlayer 
                                  channelId="preview-smart"
                                  streamUrl={previewUrl}
                                  currentChannel={{ id: "preview-smart", name: "Preview", category: "Preview", viewers: "0", logo: "" }}
                                />
                            ) : (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full"
                                    allowFullScreen
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                />
                            )}
                        </motion.div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mx-auto opacity-30">
                                <Tv size={32} className="text-zinc-500" />
                            </div>
                            <p className="text-zinc-600 text-sm font-bold">Aucun flux à prévisualiser</p>
                        </div>
                    )}
                </AnimatePresence>
                
                <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Real-Time Monitor</span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
