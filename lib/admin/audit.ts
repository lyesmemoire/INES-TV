import { supabase } from "@/lib/supabase"

/**
 * 📝 Audit Logging Utility
 * Logs sensitive admin actions to the 'admin_logs' table.
 */
export async function logAdminAction(action: string, target?: string, metadata: any = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) return

    const { error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: session.user.id,
        action,
        target,
        metadata: {
          ...metadata,
          ip: typeof window !== 'undefined' ? 'client' : 'server',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
          timestamp: new Date().toISOString()
        }
      })

    if (error) console.error('[Audit] Error logging action:', error)
  } catch (err) {
    console.error('[Audit] Failed to log admin action:', err)
  }
}
