import React from 'react';

export default function FeasibilityPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-black text-rose-500 mb-6">🔒 Masquer User ↔ Source (Feasibility)</h2>
      <div className="space-y-6">
         <div className="bg-slate-900 border border-rose-500/20 p-6 rounded-xl">
           <h3 className="text-xl font-bold text-white mb-2">Le Défi du Reverse Proxy</h3>
           <p className="text-slate-400">
             Masquer l'URL de la source HLS avec un reverse proxy (ex: Nginx pur sur le VPS) implique que 100% de la bande passante vidéo 
             transite par ton petit VPS. À 1000 utilisateurs consommant 5 Mbps, c'est du 5 Gbps soutenu. Un VPS s'effondre.
           </p>
         </div>
         <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-xl">
           <h3 className="text-xl font-bold text-white mb-2">La Solution Lean : Masquage & Tokens Temporels</h3>
           <p className="text-slate-400 mb-4">
             Au lieu de cacher physiquement l'URL (via le VPS), le backend OTT renvoie l'URL pointant vers le Cloudflare Edge CDN Worker mais <strong>totalement inutilisable</strong> sans son payload crypté exact (userId, expiry, ip).
           </p>
           <ul className="list-disc pl-5 text-slate-400 space-y-2">
             <li>Un attaquant qui copie le lien se heurte au timestamp (Expiration 5 min).</li>
             <li>Un attaquant qui modifie un paramètre est bloqué par la signature HMAC (`verify(token)` failed).</li>
             <li>Le paramètre 'uid' lie la session avec l'idempotence du Load Balancer.</li>
             <li>Chaque sous-segment `.ts` est réécrit dynamiquement et masqué au vol par l'Edge ! Aucun vol de chunk possible.</li>
           </ul>
         </div>
         <div className="bg-slate-900 border border-indigo-500/20 p-6 rounded-xl">
           <h3 className="text-xl font-bold text-white mb-2">Coût d'opération : 0$ Supplémentaire</h3>
           <p className="text-slate-400">
             Cloudflare Workers Free Tier ou un autre Provider basique edge filtre les requêtes parasites sans consommer de bande passante sur le VPS principal. Parfaite "Feasibility" Lean.
           </p>
         </div>
      </div>
    </main>
  );
}
