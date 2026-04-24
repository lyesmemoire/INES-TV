import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function test() {
  console.log('🔍 Testing Supabase connection...');
  
  // 1. Test Select
  const { data, error } = await supabase.from('Channel').select('*').limit(5);
  
  if (error) {
    console.error('❌ Table "Channel" error:', error.message);
    if (error.code === '42P01') {
      console.log('💡 Suggestion: The table "Channel" does not exist in your database.');
    }
  } else {
    console.log('✅ Connected to "Channel" table.');
    console.log('📊 Schema preview (first row):', data[0] ? Object.keys(data[0]) : 'Table is empty');
  }
}

test();
