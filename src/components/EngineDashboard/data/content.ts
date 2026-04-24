export const sections = [
  {
    id: "layer-1",
    title: "1. Orchestration & Load Balancing",
    description: "Le client interroge l'API. Le Load Balancer choisit la meilleure source via cache de santé et score de priorité/charge. Idempotence verrouillée."
  },
  {
    id: "layer-2",
    title: "2. Sécurité HMAC & Proxy Lean",
    description: "Génération temporelle d'un token HMAC au serveur (userId, IP, expiry) pour autoriser l'accès au manifeste m3u8. Masquage complet de la logique métier (pas de lourd reverse proxy)."
  },
  {
    id: "layer-3",
    title: "3. CDN Edge Workers",
    description: "Interception Cloudflare Worker ultra-rapide. Blocage Geo-IP natif et réécriture dynamique du Manifest pour apposer les signatures HMAC sur chaque segment .ts de façon transparente."
  },
  {
    id: "layer-4",
    title: "4. Session Heartbeat (Redis)",
    description: "TTL Redis (60s) maintenu par une boucle fetch (20s) sur le player. Nettoyage absolu et silence crash safe. Le Load Balancer récupère 100% de sa capacité réelle sans ghost-sessions."
  }
];

export const limits = [
  { label: "Réseau Brut", detail: "VPS 5$ = ~500 Mbps à 1 Gbps. Soit environ 300 à 1000 users par machine selon le bitrate (1080p ou 720p)." },
  { label: "Absence de CDN Caché Intégral", detail: "Un VPS seul n'est pas un cache global. En Asie, la latence restera physique (150ms+)." }
];

export const upgrades = [
  { label: "Multi-Region BGP", detail: "Cloner ce setup sur 3 continents et router via Cloudflare Load Balancing." },
  { label: "Bidding & Ads", detail: "Injection de Server-Side Ad Insertion (SSAI) sans altérer le buffer client (Phase 60)." }
];
