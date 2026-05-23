import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Create a response that we can modify (to set refreshed cookies)
    let supabaseResponse = NextResponse.next({ request });

    // ── Create Supabase client with proper getAll/setAll cookie handling ──
    // This refreshes the auth token on every request so sessions don't go stale
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Update cookies on the request (for downstream Server Components)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    // Re-create the response so the request changes propagate
                    supabaseResponse = NextResponse.next({ request });
                    // Set cookies on the response (so the browser stores them)
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // IMPORTANT: Do NOT call supabase.auth.getSession() here.
    // Use getUser() which always validates the token with the Supabase Auth server.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
}

export const config = {
    // Only run middleware on protected routes
    matcher: ['/admin/:path*', '/orders', '/orders/:path*'],
};
