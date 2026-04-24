import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { updateSession } from './utils/supabase/middleware';

/**
 * PRODUCTION SRE MIDDLEWARE
 * Strictly validates the Supabase session via SSR. No custom handlers.
 */
export async function middleware(request: NextRequest) {
  // Only process session refresh natively via Supabase SSR
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


