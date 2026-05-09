import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { AdProvider } from "@/components/ads/AdProvider";
import AuthModal from "@/src/components/Auth/AuthModal";
import BottomNav from "@/components/BottomNav";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const isFr = params.lang === 'fr';
  
  return {
    metadataBase: new URL("https://goala.tv"),
    title: {
      default: isFr ? "GOALA TV - Streaming Football en Direct HD" : "GOALA TV - Live Football Streaming HD",
      template: "%s | GOALA"
    },
    description: isFr 
      ? "Regardez les matchs de foot en direct, les exclusivités et les replays en HD sur GOALA TV. Scores en temps réel."
      : "Watch live football matches, exclusive sports streams, and on-demand highlights on GOALA TV. Real-time scores.",
    alternates: {
      canonical: `/${params.lang}`,
      languages: {
        'fr': '/fr',
        'en': '/en',
      }
    },
  };
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/Oscine-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Oscine-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <LanguageProvider>
            <AdProvider>
              {children}
              <AuthModal />
              <BottomNav />
            </AdProvider>
          </LanguageProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
        {/* 🛠️ TEMPORARY: Unregister SW to fix _next/image 404s */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  for (let registration of registrations) {
                    registration.unregister();
                    console.log('[SW] Unregistered successfully');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
