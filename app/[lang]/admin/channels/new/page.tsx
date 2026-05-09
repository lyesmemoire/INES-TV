"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Tv, Image as ImageIcon, Link as LinkIcon, Tag } from "lucide-react";
import Link from "next/link";
import SafeClient from "@/components/SafeClient";
import toast, { Toaster } from "react-hot-toast";

export default function NewChannelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    logo: "",
    streamUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || error.error || "Failed to create channel");
      }

      toast.success("Chaîne créée avec succès !");
      setTimeout(() => {
        router.push("/admin/channels");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeClient>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-black text-white p-6 md:p-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/channels"
                className="p-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                  Nouvelle Chaîne
                </h1>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                  Insertion Manuelle dans la Base de Données
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Channel Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                    <Tv size={12} /> Nom de la chaîne
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: beIN Sports 1"
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 transition-all font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                    <Tag size={12} /> Catégorie
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Sports"
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 transition-all font-bold"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <ImageIcon size={12} /> URL du Logo
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                />
              </div>

              {/* Stream URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <LinkIcon size={12} /> Source Streaming (HLS/M3U8)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://.../index.m3u8"
                  className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-600 transition-all font-mono text-sm"
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      Enregistrer la Chaîne
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* HELP PREVIEW */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 flex gap-4 items-start">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
              <Tv size={24} />
            </div>
            <div>
              <h3 className="font-bold text-emerald-500">Aperçu & Validation</h3>
              <p className="text-zinc-500 text-sm mt-1">
                Une fois créée, la chaîne sera immédiatement visible sur le site. Assurez-vous que l'URL du flux est au format HLS (.m3u8) pour une compatibilité maximale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SafeClient>
  );
}
