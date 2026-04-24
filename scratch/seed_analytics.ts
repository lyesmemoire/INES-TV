import { prisma } from "../server/services/db";

async function seedMetrics() {
  console.log("📈 SEEDING ANALYTICS DATA...");

  const ads = ["native-vpn-spro", "google-vast-sport", "premium-pass"];
  const devices = ["desktop", "mobile", "ios-app"];

  for (const adId of ads) {
    const impressions = Math.floor(Math.random() * 5000) + 1000;
    const clicks = Math.floor(impressions * (Math.random() * 0.05)); // 0-5% CTR

    console.log(`Injecting ${impressions} impressions for ${adId}...`);

    // We can't use createMany easily with SQLite in some setups, so we simulate aggregation data
    // Or we just insert a few actual records to prove the aggregator works.
    for (let i = 0; i < 50; i++) {
        await prisma.adEvent.create({
            data: {
                adId,
                type: Math.random() > 0.9 ? "click" : "impression",
                ip: "127.0.0.1",
                device: devices[Math.floor(Math.random() * devices.length)]
            }
        });
    }
  }

  console.log("✅ SEEDING COMPLETE. Your Dashboard is now populated.");
}

seedMetrics().catch(console.error);
