import { createClient, SupabaseClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}

// ✅ Lazy singleton — created on first call, NOT at module load
// This prevents build failures when SUPABASE_SERVICE_ROLE_KEY is not set at build time
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY — required for server-side operations")
  }

  _supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  return _supabaseAdmin
}

// ⚠️ Legacy export for backward compatibility — resolves lazily
// All new code should use getSupabaseAdmin() directly
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop]
  }
})
