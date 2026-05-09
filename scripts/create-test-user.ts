import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("testpassword123", 10)

  const user = await db.user.create({
    data: {
      email: "test@INES TV.com",
      passwordHash: hash,
      plan: "PREMIUM",
      role: "USER"
    }
  })

  console.log("✅ User créé:", user.email)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
