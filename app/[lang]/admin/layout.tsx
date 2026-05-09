"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  Home,
  LayoutDashboard,
  Video,
  Signal,
  Tv,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Video, label: "Matchs", href: "/admin/matches" },
  { icon: Signal, label: "Sources streaming", href: "/admin/streams" },
  { icon: Tv, label: "Chaînes IPTV", href: "/admin/channels" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Paramètres", href: "/admin/settings" },
];

export default function AdminLayout({ 
  children,
  params
}: { 
  children: React.ReactNode,
  params: { lang: string }
}) {
  // Auth is enforced at middleware level (middleware.ts)
  // No client-side guard needed — unauthenticated users never reach this component
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div 
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--color-surface-base)', color: 'var(--color-text-primary)' }}
    >
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 flex flex-col`}
        style={{ 
          backgroundColor: 'var(--color-surface-strong)', 
          borderRight: '1px solid var(--color-surface-raised)' 
        }}
      >
        {/* Header */}
        <div 
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-surface-raised)' }}
        >
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
                style={{ backgroundColor: 'var(--color-action-primary)', color: 'var(--color-text-tertiary)' }}
              >
                IA
              </div>
              <span className="font-black text-lg tracking-tighter uppercase italic">GOALA Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-inverse)' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-action-primary)' : 'transparent',
                  color: isActive ? 'var(--color-text-tertiary)' : 'var(--color-text-inverse)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  boxShadow: isActive ? '0 10px 15px -3px rgba(245, 166, 35, 0.2)' : 'none'
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div 
          className="p-4 space-y-2"
          style={{ borderTop: '1px solid var(--color-surface-raised)' }}
        >
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5"
            style={{ color: 'var(--color-text-inverse)' }}
          >
            <Home size={20} />
            {sidebarOpen && <span>Retour au site</span>}
          </Link>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-500/10 w-full"
            style={{ color: 'var(--color-action-danger)' }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
