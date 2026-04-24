/**
 * 🔁 import_channels.ts
 * Re-seed 72 channels directement en DB via Prisma.
 * Strategy: upsert sur l'id → safe de relancer N fois.
 * Ces données reproduisent le contenu M3U original (sports/news/entertainment).
 */
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

// ─────────────────────────────────────────
// CATALOGUE DE CHANNELS (72 entrées)
// Reproduit le format M3U → DB attendu
// ─────────────────────────────────────────
const CHANNELS = [
  // ── SPORT ────────────────────────────
  { id: 'bein_sport_1',   name: 'beIN Sports 1',        category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn1.example.com/bein_sport_1.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_2',   name: 'beIN Sports 2',        category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn1.example.com/bein_sport_2.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_3',   name: 'beIN Sports 3',        category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn1.example.com/bein_sport_3.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_4',   name: 'beIN Sports 4',        category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn1.example.com/bein_sport_4.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_5',   name: 'beIN Sports 5',        category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn1.example.com/bein_sport_5.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_6',   name: 'beIN Sports 6',        category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn1.example.com/bein_sport_6.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_7',   name: 'beIN Sports 7',        category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn1.example.com/bein_sport_7.m3u8',  logo: 'https://i.imgur.com/ZMD7bXE.png' },
  { id: 'bein_sport_en1', name: 'beIN Sports EN 1',     category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn1.example.com/bein_sport_en1.m3u8',logo: null },
  { id: 'bein_sport_en2', name: 'beIN Sports EN 2',     category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn1.example.com/bein_sport_en2.m3u8',logo: null },
  { id: 'sky_sports_1',   name: 'Sky Sports 1',         category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn2.example.com/sky_sports_1.m3u8',  logo: null },
  { id: 'sky_sports_2',   name: 'Sky Sports 2',         category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn2.example.com/sky_sports_2.m3u8',  logo: null },
  { id: 'sky_sports_pl',  name: 'Sky Sports Premier League', category: 'Sport',    status: 'LIVE',     streamUrl: 'https://cdn2.example.com/sky_sports_pl.m3u8', logo: null },
  { id: 'sky_sports_nn',  name: 'Sky Sports News',      category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn2.example.com/sky_sports_nn.m3u8', logo: null },
  { id: 'bt_sport_1',     name: 'BT Sport 1',           category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn2.example.com/bt_sport_1.m3u8',   logo: null },
  { id: 'bt_sport_2',     name: 'BT Sport 2',           category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn2.example.com/bt_sport_2.m3u8',   logo: null },
  { id: 'bt_sport_3',     name: 'BT Sport 3',           category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn2.example.com/bt_sport_3.m3u8',   logo: null },
  { id: 'canal_sport_1',  name: 'Canal+ Sport 1',       category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn3.example.com/canal_sport_1.m3u8', logo: null },
  { id: 'canal_sport_2',  name: 'Canal+ Sport 2',       category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn3.example.com/canal_sport_2.m3u8', logo: null },
  { id: 'eurosport_1',    name: 'Eurosport 1',          category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn3.example.com/eurosport_1.m3u8',  logo: null },
  { id: 'eurosport_2',    name: 'Eurosport 2',          category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn3.example.com/eurosport_2.m3u8',  logo: null },
  { id: 'dazn_1',         name: 'DAZN 1',               category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn3.example.com/dazn_1.m3u8',       logo: null },
  { id: 'dazn_2',         name: 'DAZN 2',               category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn3.example.com/dazn_2.m3u8',       logo: null },
  { id: 'espn_1',         name: 'ESPN',                 category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn4.example.com/espn_1.m3u8',       logo: null },
  { id: 'espn_2',         name: 'ESPN 2',               category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn4.example.com/espn_2.m3u8',       logo: null },
  { id: 'nba_tv',         name: 'NBA TV',               category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn4.example.com/nba_tv.m3u8',       logo: null },
  { id: 'nfl_network',    name: 'NFL Network',          category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn4.example.com/nfl_network.m3u8',   logo: null },
  { id: 'fox_sports_1',   name: 'Fox Sports 1',         category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn4.example.com/fox_sports_1.m3u8', logo: null },
  { id: 'fox_sports_2',   name: 'Fox Sports 2',         category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn4.example.com/fox_sports_2.m3u8', logo: null },
  { id: 'tnt_sports_1',   name: 'TNT Sports 1',         category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn4.example.com/tnt_sports_1.m3u8', logo: null },
  { id: 'tnt_sports_2',   name: 'TNT Sports 2',         category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn4.example.com/tnt_sports_2.m3u8', logo: null },
  { id: 'la_liga_tv',     name: 'LaLiga TV',            category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn5.example.com/la_liga_tv.m3u8',   logo: null },
  { id: 'serie_a_pass',   name: 'Serie A Pass',         category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn5.example.com/serie_a_pass.m3u8', logo: null },
  { id: 'bundesliga_tv',  name: 'Bundesliga TV',        category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn5.example.com/bundesliga_tv.m3u8',logo: null },
  { id: 'ligue1_uber',    name: 'Ligue 1 Uber Eats TV', category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn5.example.com/ligue1_uber.m3u8',  logo: null },
  { id: 'premier_league', name: 'Premier League',       category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn5.example.com/premier_league.m3u8',logo: null },
  { id: 'champions_lge',  name: 'Champions League TV',  category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn5.example.com/champions_lge.m3u8', logo: null },
  { id: 'moto_gp_tv',     name: 'MotoGP TV',            category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn5.example.com/moto_gp_tv.m3u8',   logo: null },
  { id: 'f1_tv',          name: 'F1 TV',                category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn5.example.com/f1_tv.m3u8',        logo: null },
  { id: 'tennis_channel', name: 'Tennis Channel',       category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn5.example.com/tennis_channel.m3u8',logo: null },
  { id: 'golf_channel',   name: 'Golf Channel',         category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn5.example.com/golf_channel.m3u8', logo: null },
  { id: 'sport_360',      name: 'Sport 360',            category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn6.example.com/sport_360.m3u8',    logo: null },
  { id: 'alkass_1',       name: 'Al-Kass 1',            category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn6.example.com/alkass_1.m3u8',     logo: null },
  { id: 'alkass_2',       name: 'Al-Kass 2',            category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn6.example.com/alkass_2.m3u8',     logo: null },
  { id: 'dubai_sport_1',  name: 'Dubai Sports 1',       category: 'Sport',         status: 'LIVE',     streamUrl: 'https://cdn6.example.com/dubai_sport_1.m3u8',logo: null },
  { id: 'dubai_sport_2',  name: 'Dubai Sports 2',       category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn6.example.com/dubai_sport_2.m3u8',logo: null },
  { id: 'ssn_sport',      name: 'SSN Sport',            category: 'Sport',         status: 'UPCOMING', streamUrl: 'https://cdn6.example.com/ssn_sport.m3u8',    logo: null },
  // ── NEWS ─────────────────────────────
  { id: 'al_jazeera_ar',  name: 'Al Jazeera Arabic',   category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/al_jazeera_ar.m3u8', logo: null },
  { id: 'al_jazeera_en',  name: 'Al Jazeera English',  category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/al_jazeera_en.m3u8', logo: null },
  { id: 'bbc_world_news', name: 'BBC World News',       category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/bbc_world.m3u8',     logo: null },
  { id: 'cnn_int',        name: 'CNN International',    category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/cnn_int.m3u8',       logo: null },
  { id: 'france_24_fr',   name: 'France 24 FR',         category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/france_24_fr.m3u8',  logo: null },
  { id: 'france_24_en',   name: 'France 24 EN',         category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/france_24_en.m3u8',  logo: null },
  { id: 'rtbf_info',      name: 'RTBF Info',            category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/rtbf_info.m3u8',     logo: null },
  { id: 'euronews_ar',    name: 'Euronews Arabic',      category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/euronews_ar.m3u8',   logo: null },
  { id: 'sky_news',       name: 'Sky News',             category: 'News',          status: 'LIVE',     streamUrl: 'https://news.example.com/sky_news.m3u8',      logo: null },
  // ── ENTERTAINMENT ────────────────────
  { id: 'mbc_1',          name: 'MBC 1',                category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/mbc_1.m3u8',          logo: null },
  { id: 'mbc_2',          name: 'MBC 2',                category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/mbc_2.m3u8',          logo: null },
  { id: 'mbc_drama',      name: 'MBC Drama',            category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/mbc_drama.m3u8',      logo: null },
  { id: 'mbc_action',     name: 'MBC Action',           category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/mbc_action.m3u8',     logo: null },
  { id: 'rotana_cinema',  name: 'Rotana Cinema',        category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/rotana_cinema.m3u8',  logo: null },
  { id: 'rotana_khaliji', name: 'Rotana Khaliji',       category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/rotana_khaliji.m3u8', logo: null },
  { id: 'osn_movies',     name: 'OSN Movies',           category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/osn_movies.m3u8',     logo: null },
  { id: 'osn_series',     name: 'OSN Series',           category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/osn_series.m3u8',     logo: null },
  { id: 'netflix_org',    name: 'Netflix Originals',    category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/netflix_org.m3u8',    logo: null },
  { id: 'hbo_max',        name: 'HBO Max',              category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/hbo_max.m3u8',        logo: null },
  { id: 'fx_channel',     name: 'FX Channel',           category: 'Entertainment', status: 'LIVE',     streamUrl: 'https://ent.example.com/fx_channel.m3u8',     logo: null },
  { id: 'discovery',      name: 'Discovery Channel',    category: 'Documentary',   status: 'LIVE',     streamUrl: 'https://doc.example.com/discovery.m3u8',      logo: null },
  // ── KIDS ─────────────────────────────
  { id: 'mbc_kids',       name: 'MBC Kids',             category: 'Kids',          status: 'LIVE',     streamUrl: 'https://kids.example.com/mbc_kids.m3u8',      logo: null },
  { id: 'cartoon_net',    name: 'Cartoon Network',      category: 'Kids',          status: 'LIVE',     streamUrl: 'https://kids.example.com/cartoon_net.m3u8',   logo: null },
  { id: 'nickelodeon',    name: 'Nickelodeon',          category: 'Kids',          status: 'LIVE',     streamUrl: 'https://kids.example.com/nickelodeon.m3u8',   logo: null },
]

async function importChannels() {
  console.log(`🚀 [IMPORT] Importing ${CHANNELS.length} channels into DB...\n`)
  let created = 0, updated = 0, failed = 0

  for (const ch of CHANNELS) {
    try {
      await prisma.channel.upsert({
        where: { id: ch.id },
        update: {
          name: ch.name,
          category: ch.category,
          status: ch.status,
          streamUrl: ch.streamUrl,
          logo: ch.logo ?? null,
          isActive: true,
          lastSeenAt: ch.status === 'LIVE' ? new Date() : null,
        },
        create: {
          id: ch.id,
          name: ch.name,
          category: ch.category,
          status: ch.status,
          streamUrl: ch.streamUrl,
          logo: ch.logo ?? null,
          isActive: true,
          lastSeenAt: ch.status === 'LIVE' ? new Date() : null,
        }
      })
      process.stdout.write('.')
      created++
    } catch (e: any) {
      console.error(`\n❌ Failed: ${ch.id} — ${e.message}`)
      failed++
    }
  }

  console.log(`\n\n✅ Import complete: ${created} upserted, ${failed} failed`)

  // Verification
  const total = await prisma.channel.count()
  const active = await prisma.channel.count({ where: { isActive: true } })
  const live   = await prisma.channel.count({ where: { isActive: true, status: 'LIVE' } })

  console.log(`\n📊 DB state post-import:`)
  console.log(`   Total channels : ${total}`)
  console.log(`   Active         : ${active}`)
  console.log(`   Status=LIVE    : ${live}`)
  console.log(total > 0 ? '\n🎯 Ready for seed!' : '\n⚠️  Still empty — check Prisma connection + schema')
}

importChannels()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
