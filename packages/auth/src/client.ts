'use client';

import { createBrowserClient } from '@supabase/ssr';

// Create Supabase client for browser. The directive is documentation as much
// as enforcement — this is only ever called from client code, and marking it
// keeps the server/client split of this package unambiguous at a glance.
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
