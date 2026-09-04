import { type NextRequest, NextResponse } from 'next/server';
import { createEdgeClient } from '@pratyagra/auth/middleware';
import { ADMIN_LEVEL_ROLES, type UserRole } from '@pratyagra/core/constants/roles';

const BLOCKED_BOTS = ['Bytespider', 'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot'];

/** Reachable without a session — otherwise signing in would be impossible. */
const PUBLIC_PATHS = ['/login', '/auth/callback'];

/**
 * Routes that authenticate themselves with a bearer token instead of a session
 * cookie. This exemption is critical: Vercel's cron GET carries
 * `Authorization: Bearer $CRON_SECRET` and no cookies, so without it the cron
 * gets a 307 to /login, receives 200 on the login HTML, and reports success
 * while the Meta catalog sync silently stops running forever. The route does
 * its own CRON_SECRET check and fails closed if the secret is unset.
 */
const SELF_AUTH_PREFIXES = ['/api/cron/'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ua = request.headers.get('user-agent') ?? '';

    if (BLOCKED_BOTS.some(bot => ua.includes(bot))) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
        return NextResponse.next();
    }
    if (SELF_AUTH_PREFIXES.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const { supabase, getResponse } = createEdgeClient(request);

    // getUser(), not getSession() — this validates the token with the Auth
    // server rather than trusting the cookie.
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // API callers get a status code, not a redirect: a fetch() from the
        // admin UI would silently follow a 307 and try to parse the login
        // page's HTML as JSON.
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
        return NextResponse.redirect(url);
    }

    // Role enforcement at the edge, before any admin JS is served. Previously
    // this was client-side only (useAdmin), so any signed-in customer passed
    // the gate and downloaded the admin bundle. useAdmin is retained for the
    // finer-grained CASHIER/MARKETING per-route scoping.
    //
    // Cost: one Supabase round trip per admin document request. The cheaper
    // end state is a Supabase custom-access-token hook stamping `role` into
    // app_metadata so this can be read from the already-verified JWT.
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = (data?.role ?? null) as UserRole | null;

    if (!role || !ADMIN_LEVEL_ROLES.includes(role)) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.search = '?error=forbidden';
        return NextResponse.redirect(url);
    }

    // getResponse(), not a captured value — setAll reassigns it on refresh.
    return getResponse();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt)$).*)',
    ],
};
