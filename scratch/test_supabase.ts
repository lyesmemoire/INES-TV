import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { supabaseAdmin } from "../lib/supabase-server";

async function test() {
  const { data, error } = await supabaseAdmin.from("Channel").select("*").limit(5);
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
