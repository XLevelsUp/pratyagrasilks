import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Lightweight auth cookie check ────────────────────────────────────────
    // Deep verification (token expiration, DB roles) happens in Server Components
    // and the useAdmin hook to avoid Edge Runtime limitations.
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
    matcher: ['/admin/:path*', '/orders', '/orders/:path*'],
};
