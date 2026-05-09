/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'wistia-video-element': false,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.supabase.co https://*.vercel.app https://*.adsterra.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; media-src 'self' blob: https:; connect-src 'self' blob: https: wss://*.supabase.co; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
}

export default nextConfig;
