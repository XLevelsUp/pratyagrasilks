import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Cookie-plumbed Supabase client for Edge middleware, shared by both apps.
 *
 * Returns `getResponse` — an accessor — rather than a response value, and that
 * distinction is load-bearing. `setAll` REASSIGNS the local `response` when
 * Supabase refreshes a session. A caller that captured the response by value
 * would hold the pre-refresh object and silently drop every refreshed auth
 * cookie, so users get bounced to login roughly hourly, intermittently, with
 * nothing in the logs. Always `return getResponse()` at the end of middleware.
 */
export function createEdgeClient(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    return { supabase, getResponse: () => response };
}
