'use client';

import Link from 'next/link';
import { ShieldOff, Home, Lock } from 'lucide-react';

export default function AccessRestrictedPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[600px] h-[600px] rounded-full blur-[120px] opacity-10" 
          style={{ backgroundColor: 'var(--color-action-danger)' }}
        />
      </div>

      <div className="relative text-center max-w-md">
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ 
                backgroundColor: 'rgba(214, 59, 47, 0.1)', 
                border: '1px solid var(--color-action-danger)' 
              }}
            >
              <ShieldOff size={40} style={{ color: 'var(--color-action-danger)' }} />
            </div>
            <div 
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--color-surface-base)', 
                border: '1px solid var(--color-action-danger)' 
              }}
            >
              <Lock size={14} style={{ color: 'var(--color-action-danger)' }} />
            </div>
          </div>
        </div>

        {/* Error code */}
        <p 
          className="uppercase"
          style={{ 
            fontSize: 'var(--font-size-xs)', 
            fontWeight: 900, 
            letterSpacing: '0.3em', 
            color: 'var(--color-action-danger)',
            marginBottom: 'var(--space-3)',
            opacity: 0.6
          }}
        >
          Erreur 403 — Accès Refusé
        </p>

        {/* Title */}
        <h1 className="hero__title" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>
          Accès Restreint
        </h1>

        {/* Description */}
        <p style={{ color: 'var(--color-text-inverse)', fontSize: 'var(--font-size-md)', fontWeight: 500, lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>
          Cette section est réservée aux administrateurs de la plateforme.
          Vous n'avez pas les privilèges nécessaires pour accéder à cette page.
        </p>

        {/* Info box */}
        <div 
          className="card text-left space-y-2"
          style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-8)' }}
        >
          <p 
            className="uppercase"
            style={{ 
              fontSize: 'var(--font-size-xs)', 
              fontWeight: 900, 
              letterSpacing: '0.1em', 
              color: 'var(--color-text-inverse)',
              marginBottom: 'var(--space-3)'
            }}
          >
            Informations
          </p>
          <div className="flex items-center gap-2" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-inverse)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-action-danger)' }} />
            Rôle requis : <span style={{ color: 'var(--color-action-danger)', fontWeight: 'bold', marginLeft: '4px' }}>ADMIN</span>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-inverse)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-surface-raised)' }} />
            Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="btn btn--secondary"
          style={{ padding: 'var(--space-3) var(--space-6)', textDecoration: 'none' }}
        >
          <Home size={16} />
          Retour à l'accueil
        </Link>

        {/* Footer note */}
        <p 
          className="uppercase"
          style={{ 
            fontSize: 'var(--font-size-xs)', 
            fontWeight: 900, 
            letterSpacing: '0.1em', 
            color: 'var(--color-surface-raised)',
            marginTop: 'var(--space-8)'
          }}
        >
          INES TV PRO — Accès Sécurisé
        </p>
      </div>
    </div>
  );
}
