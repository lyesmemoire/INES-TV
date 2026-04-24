import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 Seeding Historical Ad Revenue for AI Yield Training...');

  const providers = ['google', 'appnexus', 'rubicon'];
  const devices = ['TV', 'Mobile', 'Web'];
  const countries = ['FR', 'US', 'UK', 'MA', 'Unknown'];

  // Clear old revenue data to have a clean AI state for testing
  await (prisma as any).adRevenue.deleteMany({});

  const records = [];

  // Generate 500 records of historical data
  for (let i = 0; i < 500; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    // Logic: 
    // TV generates 3x more CPM than Web
    // US generates 2x more CPM than Others
    // Google is more efficient on TV
    let baseCpm = 2.5; // Base $2.5 CPM
    
    if (device === 'TV') baseCpm *= 3.5;
    if (device === 'Mobile') baseCpm *= 1.8;
    if (country === 'US') baseCpm *= 2.2;
    if (country === 'FR') baseCpm *= 1.5;
    
    // Provider specific strengths (AI will learn this)
    if (provider === 'google' && device === 'TV') baseCpm *= 1.4;
    if (provider === 'rubicon' && country === 'US') baseCpm *= 1.3;

    // Add some randomness
    const finalCpm = baseCpm + (Math.random() * 2);

    records.push({
      provider,
      device,
      country,
      cpm: finalCpm,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7) // Last 7 days
    });
  }

  await (prisma as any).adRevenue.createMany({
    data: records
  });

  console.log(`✅ AI Training Complete! Inserted ${records.length} revenue records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
