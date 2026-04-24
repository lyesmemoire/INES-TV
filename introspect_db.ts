import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function introspect() {
  console.log('--- TABLES INFO ---');
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema IN ('public', 'auth')
    ORDER BY table_schema, table_name;
  `);
  console.log(JSON.stringify(tables, null, 2));

  console.log('\n--- User COLUMNS ---');
  try {
    const userCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'User' AND table_schema = 'public';
    `);
    console.log(JSON.stringify(userCols, null, 2));
  } catch (e) {
    console.log('Table "User" not found or error.');
  }

  console.log('\n--- profiles COLUMNS ---');
  try {
    const profileCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'profiles' AND table_schema = 'public';
    `);
    console.log(JSON.stringify(profileCols, null, 2));
  } catch (e) {
    console.log('Table "profiles" not found.');
  }

  console.log('\n--- COUNTS ---');
  const counts = {
    authUsers: 0,
    channels: 0,
    videos: 0,
    stream_events: 0
  };

  try {
    const authCount = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM auth.users');
    counts.authUsers = (authCount as any)[0].count;
  } catch (e) { console.log('Err auth.users'); }

  try {
    const channelCount = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM public.channels');
    counts.channels = (channelCount as any)[0].count;
  } catch (e) { console.log('Err channels'); }

  try {
    const videoCount = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM public.videos');
    counts.videos = (videoCount as any)[0].count;
  } catch (e) { console.log('Err videos'); }

  try {
    const eventCount = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM public.stream_events');
    counts.stream_events = (eventCount as any)[0].count;
  } catch (e) { console.log('Err stream_events'); }

  console.log(JSON.stringify(counts, null, 2));
}

introspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
