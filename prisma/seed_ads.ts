import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ad Providers and Configuration...');

  // 1. Initial Ad Providers
  const providers = [
    {
      name: 'google',
      baseUrl: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/12345/example&sz=640x480&output=xml_vast4&unviewed_position_start=1&env=vp&gdfp_req=1&correlator={{CORRELATOR}}&cust_params={{KEYWORDS}}',
      active: true,
      priority: 0,
    },
    {
      name: 'appnexus',
      baseUrl: 'https://ib.adnxs.com/ut/vast?placement_id=123456&user_id={{USER_ID}}&{{KEYWORDS}}',
      active: true,
      priority: 1,
    },
    {
      name: 'rubicon',
      baseUrl: 'https://ads.rubiconproject.com/ad/1234.xml?site=5678&zone=91011&width=640&height=360&{{KEYWORDS}}',
      active: true,
      priority: 2,
    },
  ];

  for (const p of providers) {
    await prisma.adProvider.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  // 2. Default App Config
  await prisma.appConfig.upsert({
    where: { key: 'ad_frequency_seconds' },
    update: { value: '900' },
    create: { key: 'ad_frequency_seconds', value: '900' },
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
