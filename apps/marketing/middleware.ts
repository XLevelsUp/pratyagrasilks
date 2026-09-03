import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const BLOCKED_BOTS = ['Bytespider', 'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot'];

const PROTECTED_PATHS = ['/admin', '/orders'];

function isProtectedPath(pathname: string): boolean {
    return PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ua = request.headers.get('user-agent') ?? '';

    // Block aggressive scrapers at the edge before any auth or DB work
    if (BLOCKED_BOTS.some(bot => ua.includes(bot))) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // Only run auth checks on protected routes
    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

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
    matcher: [
        // Run on all routes except Next.js internals and static assets
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
};
