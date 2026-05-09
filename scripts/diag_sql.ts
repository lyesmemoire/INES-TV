import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });
  await client.connect();
  console.log("🔍 Connected to DB. Querying FreeChannel...");
  try {
    const res = await client.query('SELECT count(*) FROM "FreeChannel"');
    console.log(`📊 Count in FreeChannel: ${res.rows[0].count}`);
    
    if (parseInt(res.rows[0].count) > 0) {
      const channels = await client.query('SELECT id, name, slug FROM "FreeChannel" LIMIT 5');
      console.log('✅ Channels found:');
      channels.rows.forEach(r => console.log(` - ${r.name} (${r.slug})`));
    }
  } catch (e) {
    const err = e as any;
    console.error("❌ SQL Error:", err.message);
  } finally {
    await client.end();
  }
}

main();
