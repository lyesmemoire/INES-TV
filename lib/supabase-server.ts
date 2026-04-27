import { createClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

// Support both NEXT_PUBLIC and private versions for safety
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!serviceKey) {
  console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to anonymous access.")
}

// ✅ Service Role = bypass RLS (Server-side ONLY)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
