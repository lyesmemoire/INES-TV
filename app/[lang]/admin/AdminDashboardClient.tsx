"use client"

import { useMetrics } from "@/src/hooks/useMetrics"
import StreamHealthPanel from "./components/StreamHealthPanel"
import UserSessionsMap from "./components/UserSessionsMap"
import AlertsPanel from "./components/AlertsPanel"
import RealtimeGraph from "./components/RealtimeGraph"
import StatsCard from "./components/StatsCard"
import SafeClient from "@/components/SafeClient"

export default function AdminDashboardClient() {
  const { metrics, history, connected, lastUpdated } = useMetrics()

  return (
    <SafeClient>
      <main 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}
      >

        {/* HEADER */}
        <header className="nav-bar sticky top-0 z-50">
          <div className="flex flex-col">
            <h1 className="italic uppercase" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900, letterSpacing: '-0.05em' }}>
              ⚡ GOALA Monitoring
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-inverse)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Surveillance système en temps réel
            </p>
          </div>

          <div className="flex items-center gap-6">
            {lastUpdated && (
              <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--color-text-inverse)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mis à jour : {lastUpdated}
              </div>
            )}

            <div 
              style={{ 
                padding: 'var(--space-2) var(--space-4)', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '10px', 
                fontWeight: 900, 
                letterSpacing: '0.1em',
                backgroundColor: connected ? 'rgba(245, 166, 35, 0.1)' : 'rgba(214, 59, 47, 0.1)',
                color: connected ? 'var(--color-action-primary)' : 'var(--color-action-danger)',
                border: connected ? '1px solid var(--color-action-primary)' : '1px solid var(--color-action-danger)'
              }}
            >
              {connected ? "● LIVE" : "○ OFFLINE"}
            </div>
            
            <a 
              href="/" 
              className="btn btn--secondary"
              style={{ minWidth: 'auto', padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--font-size-xs)' }}
            >
              Quitter
            </a>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-8 lg:p-12 space-y-12 max-w-[1800px] mx-auto w-full">
          
          {!metrics && !connected ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
               <div 
                className="w-12 h-12 border-4 rounded-full animate-spin" 
                style={{ borderColor: 'rgba(245, 166, 35, 0.1)', borderTopColor: 'var(--color-action-primary)' }}
               />
               <p style={{ color: 'var(--color-text-inverse)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 'var(--font-size-xs)', letterSpacing: '0.1em' }}>
                  Initialisation de la connexion aux métriques Edge...
               </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard 
                  label="Utilisateurs" 
                  value={metrics?.activeUsers ?? 0} 
                  change={2.5} 
                  icon="👥" 
                  color="orange" 
                />
                <StatsCard 
                  label="Flux Actifs" 
                  value={metrics?.activeStreams ?? 0} 
                  change={-1.2} 
                  icon="📡" 
                  color="orange" 
                />
                <StatsCard 
                  label="Latence" 
                  value={(metrics?.avgLatency ?? 0) + "ms"} 
                  change={-5.0} 
                  icon="⚡" 
                  color="orange" 
                />
                <StatsCard 
                  label="Taux Erreur" 
                  value={(metrics?.errorRate ?? 0) + "%"} 
                  change={0.1} 
                  icon="⚠️" 
                  color="orange" 
                />
              </div>

              <div className="card" style={{ padding: 'var(--space-8)' }}>
                <RealtimeGraph 
                  data={history} 
                  metrics={["activeUsers", "activeStreams", "avgLatency"]} 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StreamHealthPanel streams={metrics?.streamHealth ?? []} />
                <AlertsPanel />
              </div>

              <UserSessionsMap />
            </>
          )}
        </div>
      </main>
    </SafeClient>
  )
}
