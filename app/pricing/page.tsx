"use client";

import Link from "next/link";

/**
 * 💰 PRICING PAGE
 * Focus on "Revenue Unlock" and "Monetization Scaling".
 * Manual onboarding for Pro/Scale to maximize deal value.
 */
export default function PricingPage() {
  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <nav className="p-8">
        <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs">SP</div>
            <span className="text-xl font-black uppercase tracking-tight">StreamPerf</span>
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Simple, Revenue-Driven Pricing.</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Stop leaving money on the table. Choose a plan that matches your scale <br className="hidden md:block"/> 
            and unlock your full monetization potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <PricingCard 
            tier="Free"
            price="$0"
            desc="Perfect for testing and low-volume sites."
            features={[
                "Up to 10k impressions /day",
                "Advanced CSS Slots",
                "Basic Analytics",
                "Community Support"
            ]}
            cta="Get Started Free"
            href="/login"
          />

          <PricingCard 
            tier="Professional"
            price="$19"
            unit="/mo"
            desc="For growing publishers ready to scale revenue."
            features={[
                "Unlimited Impressions",
                "Priority Auction Path",
                "Revenue-Unlock Engine",
                "Real-time Yield Support",
                "Standard API Access"
            ]}
            cta="Unlock Pro Revenue"
            href="mailto:sales@streamperf.com?subject=Upgrade to Pro"
            highlight
          />

          <PricingCard 
            tier="Enterprise"
            price="Custom"
            desc="Industrial scale for high-traffic networks."
            features={[
                "Custom Revenue Optimization",
                "Dedicated Ad Ops Manager",
                "Premium Brand Safety",
                "Whitelabel Dashboard",
                "Custom Endpoints"
            ]}
            cta="Talk to Scale Experts"
            href="mailto:sales@streamperf.com?subject=Enterprise Scale Inquiry"
          />
        </div>

        <div className="mt-24 text-center">
            <p className="text-slate-500 font-medium mb-4 uppercase tracking-widest text-xs">Trusted by high-performance publishers</p>
            <div className="flex flex-wrap justify-center gap-10 opacity-30 grayscale contrast-125">
                <span className="text-2xl font-black italic">TECHWAVE</span>
                <span className="text-2xl font-black italic">MEDIABLAST</span>
                <span className="text-2xl font-black italic">GLOBALSTREAM</span>
                <span className="text-2xl font-black italic">ADVENTURE.NET</span>
            </div>
        </div>
      </main>
    </div>
  );
}

function PricingCard({ tier, price, unit = "", desc, features, cta, href, highlight = false }) {
  return (
    <div className={`p-10 rounded-[32px] border transition-all duration-500 flex flex-col ${
      highlight 
      ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-10' 
      : 'bg-slate-900 border-white/5 hover:border-white/10'
    }`}>
      <div className="mb-8">
        <h3 className={`text-lg font-black uppercase tracking-widest mb-4 ${highlight ? 'text-blue-100' : 'text-slate-500'}`}>
          {tier}
        </h3>
        <div className="flex items-baseline gap-1 mb-2">
            <span className="text-5xl font-black tracking-tighter">{price}</span>
            <span className={`text-xl font-bold ${highlight ? 'text-blue-200' : 'text-slate-500'}`}>{unit}</span>
        </div>
        <p className={`text-sm font-medium leading-relaxed ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>
          {desc}
        </p>
      </div>

      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${highlight ? 'bg-white text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
              ✓
            </div>
            <span className={`text-sm font-bold ${highlight ? 'text-white' : 'text-slate-300'}`}>{f}</span>
          </li>
        ))}
      </ul>

      <Link 
        href={href} 
        className={`w-full py-5 rounded-2xl font-black text-center transition-all active:scale-95 shadow-xl ${
          highlight 
          ? 'bg-white text-blue-600 hover:bg-slate-100 shadow-white/10' 
          : 'bg-slate-800 text-white hover:bg-slate-700 shadow-black/20'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
