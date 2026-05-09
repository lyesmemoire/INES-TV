const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function run() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.rpc('get_tables'); 
  // Wait, RPC didn't work. Let's just try to select from 'stream_sources'.
  const { error: err1 } = await supabase.from('stream_sources').select('*').limit(1);
  if (err1) console.log('Error reading stream_sources:', err1.message);
  else console.log('stream_sources EXISTS');

  const { error: err2 } = await supabase.from('Stream').select('*').limit(1);
  if (err2) console.log('Error reading Stream:', err2.message);
  else console.log('Stream EXISTS');

  const { error: err3 } = await supabase.from('channels').select('*').limit(1);
  if (err3) console.log('Error reading channels:', err3.message);
  else console.log('channels EXISTS');

  const { error: err4 } = await supabase.from('Channel').select('*').limit(1);
  if (err4) console.log('Error reading Channel:', err4.message);
  else console.log('Channel EXISTS');
}

run();
