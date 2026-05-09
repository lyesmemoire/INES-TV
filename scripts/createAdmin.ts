import { prisma } from "../server/services/db.js";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  const email = "admin@INES TV.com";
  const password = "Admin123!";

  console.log("🚀 Creating admin account...");
  const hashed = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { password: hashed },
      create: {
        email,
        password: hashed,
      },
    });
    console.log("✅ Admin successfully created or updated:", admin.email);
    console.log("📧 Email:", email);
    console.log("🔑 Password: (as provided in user request)");
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
