import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock"
);
