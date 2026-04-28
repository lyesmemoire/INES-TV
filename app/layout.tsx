import './globals.css'
import '@/src/styles/main.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PWAUpdateNotification from '@/components/PWAUpdateNotification'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://inestv.com'),
  title: 'INES TV - Live Sports Streaming',
  description: 'Watch live football, basketball and more in HD quality — stream highlights and matches',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'INES TV',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'INES TV',
    title: 'INES TV - Live Sports Streaming',
    description: 'Watch live football and sports highlights in HD',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INES TV',
    description: 'Live sports streaming platform',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

import { PWAErrorBoundary } from '@/components/PWAErrorBoundary'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* PWA Meta Tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Splash screens for iOS */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_14_Pro_Max_portrait.png"
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
        
        {/* PWA Components */}
        <PWAErrorBoundary>
          <PWAInstallPrompt />
          <PWAUpdateNotification />
        </PWAErrorBoundary>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
