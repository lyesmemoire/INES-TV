import { MetadataRoute } from 'next';
import { prisma } from '@/server/services/db';

// 🛡️ Force dynamic rendering — sitemap needs live DB data, cannot be statically generated at build time
export const dynamic = 'force-dynamic';

/**
 * 🌍 GLOBAL MULTI-LANGUAGE SITEMAP (Phase 26)
 * Automatically indexes all channels and events across 4 languages: EN, FR, ES, DE.
 * Multiplies organic reach by 4x for international "Live" keywords.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://streamperf-pro.com';
  const languages = ['en', 'fr', 'es', 'de'];

  // 1. Fetch all active channels
  const channels = await prisma.channel.findMany({
    where: { isActive: true },
    select: { id: true, name: true, updatedAt: true }
  });

  // 2. Fetch live or upcoming sport events
  const today = new Date();
  const twoDaysAgo = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));
  
  const events = await prisma.program.findMany({
    where: { startTime: { gte: twoDaysAgo } },
    select: { id: true, title: true, startTime: true }
  });

  const entries: MetadataRoute.Sitemap = [];

  // 3. Generate Entries for each language
  languages.forEach((lang) => {
    // Channel Entries
    channels.forEach((channel) => {
      const slug = channel.name.toLowerCase().replace(/\s+/g, '-');
      entries.push({
        url: `${baseUrl}/${lang}/watch/${slug}`,
        lastModified: channel.updatedAt,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });

    // Event Entries
    events.forEach((event) => {
      const slug = event.title.toLowerCase().replace(/\s+/g, '-');
      entries.push({
        url: `${baseUrl}/${lang}/watch/${slug}-live`,
        lastModified: event.startTime,
        changeFrequency: 'hourly',
        priority: 1.0,
      });
    });
  });

  // 4. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    }
  ];

  return [...staticPages, ...entries];
}
