import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login, user } = useAuth();
  const { t } = useLanguage();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLoginView) {
        // 1. Login with Supabase
        await login(email, password);

        // 2. Redirection Admin si nécessaire (Détecté via métadonnées Supabase)
        if (user?.role === 'ADMIN') {
          setAuthModalOpen(false);
          window.location.href = '/admin';
          return;
        }


        setAuthModalOpen(false);
      } else {
        // Register with Supabase
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: 'USER'
            }
          }
        });

        if (signUpError) throw signUpError;
        
        setIsLoginView(true);
        setPassword('');
        setError('Compte créé avec succès. Veuillez vérifier vos emails ou vous connecter.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    setTimeout(() => {
      setEmail('');
      setPassword('');
      setName('');
      setError(null);
      setIsLoginView(true);
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Subtle Glow Background */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
          
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              {isLoginView ? t('auth.login') : 'Sign Up'}
            </h2>
            <p className="text-sm font-semibold text-zinc-400">
              {isLoginView 
                ? 'Welcome back to StreamPerf Pro.' 
                : 'Join us for the ultimate streaming experience.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${
                  error.includes('succès') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {!isLoginView && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nom complet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : isLoginView ? (
                <>Se connecter <LogIn size={18} /></>
              ) : (
                <>Créer mon compte <UserPlus size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
              <button
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError(null);
              }}
              className="text-zinc-400 hover:text-white text-sm font-bold transition-colors"
            >
              {isLoginView 
                ? "No account yet? Register" 
                : "Already have an account? Login"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
