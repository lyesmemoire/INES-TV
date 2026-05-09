"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * 🔐 SECURE LOGIN PAGE - GOALA TV
 * Supports both Password and Magic Link for high-performance authentication.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordMode, setIsPasswordMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    // 🍯 Honeypot check
    const formData = new FormData(e.target as HTMLFormElement);
    if (formData.get('b_honeypot')) {
      console.warn("[Security] Honeypot triggered by bot.");
      return; 
    }

    setLoading(true);

    try {
      // 🛡️ Rate Limit Shield check
      const shield = await fetch('/api/login', { method: 'POST' });
      if (shield.status === 429) {
        throw new Error("Trop de tentatives. Veuillez patienter une minute.");
      }

      if (isPasswordMode) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Manual cookie sync for Next.js middleware (middleware expects sb-access-token)
        if (data?.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax`;
        }
        
        // Successful login
        router.push("/fr/admin"); 
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/dashboard" : ""
          }
        });
        if (error) throw error;
        setSent(true);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Background Ambient Light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-action-primary)' }}
        />
      </div>

      <div className="card w-full max-w-md shadow-2xl z-10" style={{ padding: 'var(--space-8)' }}>
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs"
              style={{ backgroundColor: 'var(--color-action-primary)', color: 'var(--color-text-tertiary)' }}
            >
              GTV
            </div>
            <span 
              className="text-2xl font-black uppercase tracking-tighter italic"
              style={{ color: 'var(--color-text-primary)' }}
            >
              GOALA TV
            </span>
          </Link>
          <h1 className="hero__title" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>
            {isPasswordMode ? "Connexion" : "Lien Magique"}
          </h1>
          <p style={{ color: 'var(--color-text-inverse)', fontWeight: 500 }}>
            {isPasswordMode ? "Accédez à votre espace sécurisé." : "Identifiez-vous sans mot de passe."}
          </p>
        </div>

        {sent ? (
          <div 
            className="text-center"
            style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: 'var(--space-7)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <div className="text-4xl mb-4">✉️</div>
            <h2 style={{ color: '#10b981', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>Lien envoyé !</h2>
            <p className="card-body">Consultez votre boîte mail. Le lien expire dans 5 minutes.</p>
            <button 
              onClick={() => setSent(false)} 
              className="link mt-6 block w-full text-center"
              style={{ textDecoration: 'none', color: 'var(--color-action-primary)', fontWeight: 'bold' }}
            >
              Retourner à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 🍯 Honeypot field */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <input type="text" name="b_honeypot" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                required
                type="email"
                placeholder="admin@goala.tv"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {isPasswordMode && (
              <div className="input-group">
                <label className="input-label">Mot de passe</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="btn btn--primary w-full"
              style={{ padding: 'var(--space-5)' }}
            >
              {loading ? "Connexion..." : isPasswordMode ? "Se connecter" : "Envoyer le lien"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsPasswordMode(!isPasswordMode)}
                className="link"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-action-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {isPasswordMode ? "Utiliser un lien magique" : "Utiliser mon mot de passe"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
