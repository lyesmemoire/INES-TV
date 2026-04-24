import { createClient } from '@supabase/supabase-js';
import { MOCK_CHANNELS } from '../src/utils/mock';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log(`🚀 Starting sync of ${MOCK_CHANNELS.length} channels to Supabase...`);
  
  for (const channel of MOCK_CHANNELS) {
    try {
      const { error } = await supabase
        .from('Channel')
        .upsert({
          id: channel.id,
          name: channel.name,
          category: channel.category,
          logo: channel.logo,
          viewers: channel.viewers,
          streamSources: channel.streamSources, // Store as JSON
          status: 'LIVE',           // Default status
          isActive: true,
          updatedAt: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Failed to sync ${channel.name}:`, error.message);
      } else {
        console.log(`✅ Synced: ${channel.name}`);
      }
    } catch (e) {
      console.error(`💥 Unexpected error for ${channel.name}:`, e);
    }
  }
  
  console.log('🎯 Sync operation finished!');
}

sync();
