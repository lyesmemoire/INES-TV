import { createClient } from "@supabase/supabase-js";

/**
 * 🔐 SUPABASE CLIENT (GLOBAL)
 * Production-ready instance for Auth & Multi-Tenancy.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ [Supabase] Missing credentials. Auth will not function correctly.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
