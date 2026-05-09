import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { parseM3U } from '../src/lib/iptv/parseM3U';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseKey || !supabaseKey.startsWith('sb_secret')) {
  console.error("Missing or invalid SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting DB clear...");
  // Clear the table. Using a match that matches everything
  const { error: delError } = await supabaseAdmin.from('Channel').delete().neq('id', 'dummy_id_never_matches_anything');
  if (delError) {
    console.error("Error clearing table:", delError);
    process.exit(1);
  }
  console.log("Successfully cleared existing channels.");

  console.log("Fetching new M3U playlist...");
  const url = "https://t.freetv.fun/m3u/kids_original.m3u";
  const res = await fetch(url);
  const text = await res.text();

  console.log("Parsing M3U playlist...");
  const parsedChannels = parseM3U(text);
  console.log(`Found ${parsedChannels.length} channels in the playlist.`);

  const batchSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < parsedChannels.length; i += batchSize) {
    const batch = parsedChannels.slice(i, i + batchSize);
    
    const { error } = await supabaseAdmin.from('Channel').insert(
      batch.map((ch: any) => ({
        name: ch.name || "Unknown",
        streamUrl: ch.url || "",
        logo: ch.logo || null,
        category: ch.group || ch.category || "Kids",
        isActive: true,
        status: "LIVE",
      }))
    );

    if (error) {
      console.error(`Batch ${i} error:`, error.message);
    } else {
      totalInserted += batch.length;
      console.log(`Inserted batch ${i} to ${i + batch.length} (${totalInserted}/${parsedChannels.length})`);
    }
  }

  console.log("Done! Total inserted:", totalInserted);
}

run().catch(console.error);
