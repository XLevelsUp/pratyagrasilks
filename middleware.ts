import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── 1. Lightweight Authentication Check ──────────────────────────────────
    // We only perform a soft check for the Supabase auth cookie here.
    // Deep verification (token expiration, DB roles) happens in the Node.js
    // runtime (Server Components, API routes) to avoid Edge Runtime warnings.
    const hasAuthCookie = request.cookies.getAll().some(cookie =>
        cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    );

    if (!hasAuthCookie) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Only run middleware on protected routes
    matcher: ['/admin/:path*', '/orders', '/orders/:path*'],
};
