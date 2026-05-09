import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  const channels = [
    { name: "France 2", country: "FR", language: "fr", category: "General" },
    { name: "France 3", country: "FR", language: "fr", category: "General" },
    { name: "BFM TV", country: "FR", language: "fr", category: "News" },
    { name: "CNews", country: "FR", language: "fr", category: "News" },
    { name: "TV5 Monde", country: "FR", language: "fr", category: "General" },
    { name: "Al Aoula", country: "MA", language: "ar", category: "General" },
    { name: "2M Maroc", country: "MA", language: "ar", category: "General" },
    { name: "ENTV Algérie", country: "DZ", language: "ar", category: "General" },
    { name: "El Bilad TV", country: "DZ", language: "ar", category: "News" },
    { name: "Wataniya 1", country: "TN", language: "ar", category: "General" },
  ]

  for (const c of channels) {
    const slug = c.name.toLowerCase().replace(/\s/g, "-")
    await prisma.freeChannel.upsert({
      where: { slug: slug },
      update: {},
      create: {
        ...c,
        slug
      }
    })
  }

  console.log("✅ FTA Seed Done")
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
