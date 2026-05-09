import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

const CHANNELS = [
  // ── SPORT ────────────────────────────
  { id: 'bein_sport_1',   name: 'beIN Sports 1',        category: 'Sport',         country: 'International', language: 'Arabic', streamUrl: 'https://cdn1.example.com/bein_sport_1.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_2',   name: 'beIN Sports 2',        category: 'Sport',         country: 'International', language: 'Arabic', streamUrl: 'https://cdn1.example.com/bein_sport_2.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_3',   name: 'beIN Sports 3',        category: 'Sport',         country: 'International', language: 'Arabic', streamUrl: 'https://cdn1.example.com/bein_sport_3.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'tf1',            name: 'TF1',                  category: 'General',       country: 'France',        language: 'French', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/TF1_logo_2013.svg' },
  { id: 'france-2',       name: 'France 2',             category: 'General',       country: 'France',        language: 'French', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/France_2_logo_2018.svg' },
  { id: 'france-3',       name: 'France 3',             category: 'General',       country: 'France',        language: 'French', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/France_3_logo_2018.svg' },
  { id: 'm6',             name: 'M6',                   category: 'General',       country: 'France',        language: 'French', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/M6_logo.svg' },
  { id: 'bbc-one',        name: 'BBC One',              category: 'General',       country: 'UK',            language: 'English', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/BBC_One_logo_2021.svg' },
  { id: 'cnn',            name: 'CNN International',    category: 'News',          country: 'USA',           language: 'English', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg' },
];

async function main() {
  console.log("🚀 [IMPORT FTA] Seeding Free Channels...");
  
  for (const ch of CHANNELS) {
    const slug = slugify(ch.name, { lower: true, strict: true });
    
    try {
      await prisma.freeChannel.upsert({
        where: { slug },
        update: {
          name: ch.name,
          category: ch.category,
          country: ch.country,
          language: ch.language,
          logo: ch.logo,
          isActive: true,
          isFeatured: true,
          featuredOrder: 1
        },
        create: {
          slug,
          name: ch.name,
          category: ch.category,
          country: ch.country,
          language: ch.language,
          logo: ch.logo,
          isActive: true,
          isFeatured: true,
          featuredOrder: 1,
          streams: {
            create: {
              url: ch.streamUrl,
              type: 'M3U8',
              priority: 1,
              isActive: true
            }
          }
        }
      });
      console.log(`✅ Imported: ${ch.name} -> /tv/${slug}`);
    } catch (e: any) {
      console.error(`❌ Error importing ${ch.name}:`, e.message);
    }
  }

  console.log("\n🎯 FTA Seed Complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
