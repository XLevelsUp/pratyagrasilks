import { type NextRequest, NextResponse } from 'next/server';
import { createEdgeClient } from '@pratyagra/auth/middleware';

const BLOCKED_BOTS = ['Bytespider', 'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot'];

// Customer order history. /admin is gone — it lives on the admin host now,
// behind that app's own middleware, which additionally enforces role at the
// edge. /profile is deliberately left unprotected, matching pre-split
// behaviour; changing it would be a behaviour change, not a refactor.
const PROTECTED_PATHS = ['/orders'];

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

    // Refreshes the auth token on every request so sessions don't go stale.
    const { supabase, getResponse } = createEdgeClient(request);

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

    // getResponse(), not a captured value — setAll reassigns it on refresh.
    return getResponse();
}

export const config = {
    matcher: [
        // Run on all routes except Next.js internals and static assets
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
};
