import { prisma } from "../server/services/db.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

const RESELLERS = [
  {
    name: "Reseller Demo",
    email: "reseller@streamperf.com",
    password: "Reseller123!",
    credits: 50,
  },
];

async function main() {
  console.log("🚀 Seeding reseller accounts...");

  for (const r of RESELLERS) {
    const hashed = await bcrypt.hash(r.password, 10);
    const reseller = await prisma.reseller.upsert({
      where: { email: r.email },
      update: { password: hashed, credits: r.credits },
      create: {
        name: r.name,
        email: r.email,
        password: hashed,
        credits: r.credits,
      },
    });
    console.log(`✅ Reseller created: ${reseller.email} (${reseller.credits} credits)`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
