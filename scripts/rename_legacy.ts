import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function renameLegacy() {
  console.log("Renaming legacy tables to safe deprecation state...");
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS "profiles" RENAME TO "_deprecated_profiles";`);
    console.log("✅ Renamed: profiles -> _deprecated_profiles");
    
    await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS "videos" RENAME TO "_deprecated_videos";`);
    console.log("✅ Renamed: videos -> _deprecated_videos");
    
    await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS "stream_events" RENAME TO "_deprecated_stream_events";`);
    console.log("✅ Renamed: stream_events -> _deprecated_stream_events");
    
    console.log("🎯 Legacy cleanup complete!");
  } catch (e: any) {
    console.error("❌ Error renaming tables:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

renameLegacy();
